<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Company;
use App\Models\CompanyResearchEntry;
use App\Models\FollowUp;
use App\Models\SavedJobRequirement;
use App\Models\UserSkill;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CareerToolsController extends Controller
{
    public function analytics(Request $request)
    {
        $filters = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);
        $baseQuery = $this->ownedApplications($request)
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->where('applied_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->where('applied_at', '<=', $to));
        $applications = (clone $baseQuery)
            ->select(['applications.id', 'applications.company_id', 'applications.job_title', 'applications.status', 'applications.applied_at', 'applications.source'])
            ->with(['statusHistory:id,application_id,previous_status,new_status,recorded_at'])
            ->get();
        $statusCounts = (clone $baseQuery)
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $outcomeCounts = (clone $baseQuery)
            ->whereIn('status', ['Offer', 'Rejected', 'Withdrawn'])
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $companyCounts = (clone $baseQuery)
            ->join('companies', 'companies.id', '=', 'applications.company_id')
            ->select(DB::raw("COALESCE(companies.name, 'Unknown') as label"), DB::raw('COUNT(*) as aggregate'))
            ->groupBy('companies.name')
            ->pluck('aggregate', 'label');
        $jobTitleCounts = (clone $baseQuery)
            ->select('job_title', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('job_title')
            ->pluck('aggregate', 'job_title');
        $sourceCounts = (clone $baseQuery)
            ->selectRaw("COALESCE(source, 'Not recorded') as label, COUNT(*) as aggregate")
            ->groupBy('source')
            ->pluck('aggregate', 'label');

        $eligible = $applications->where('status', '!=', 'Withdrawn');
        $responseStatuses = ['Screening', 'Interview', 'Offer', 'Rejected'];
        $responded = $eligible->filter(fn ($application) =>
            in_array($application->status, $responseStatuses, true)
            || $application->statusHistory->contains(fn ($history) => in_array($history->new_status, $responseStatuses, true))
        );
        $interviewed = $eligible->filter(fn ($application) =>
            $application->status === 'Interview'
            || $application->statusHistory->contains(fn ($history) => $history->new_status === 'Interview')
        );
        $responseDays = $responded->map(function ($application) {
            $history = $application->statusHistory
                ->whereIn('new_status', ['Screening', 'Interview', 'Offer', 'Rejected'])
                ->sortBy('recorded_at')
                ->first();

            if (!$history || !$application->applied_at) {
                return null;
            }

            $appliedAt = Carbon::parse($application->applied_at);
            $respondedAt = Carbon::parse($history->recorded_at);

            return $respondedAt->greaterThanOrEqualTo($appliedAt)
                ? $appliedAt->diffInDays($respondedAt)
                : null;
        })->filter(fn ($days) => $days !== null);
        $transitionDays = $applications->flatMap(function ($application) {
            $history = $application->statusHistory->sortBy('recorded_at')->values();
            $durations = [];
            for ($index = 1; $index < $history->count(); $index++) {
                $from = Carbon::parse($history[$index - 1]->recorded_at);
                $to = Carbon::parse($history[$index]->recorded_at);
                if ($to->greaterThanOrEqualTo($from)) {
                    $durations[] = $from->diffInDays($to);
                }
            }

            return $durations;
        });
        $rejectionStages = $eligible->where('status', 'Rejected')
            ->groupBy(function ($application) {
                $lastChange = $application->statusHistory->sortByDesc('recorded_at')->first();
                return $lastChange?->previous_status ?: 'Stage not recorded';
            })
            ->map->count();

        return response()->json([
            'total' => $baseQuery->count(),
            'statuses' => $statusCounts,
            'eligible_sample' => $eligible->count(),
            'interview_rate' => $this->rate($interviewed->count(), $eligible->count()),
            'interview_sample' => $eligible->count(),
            'response_rate' => $this->rate($responded->count(), $eligible->count()),
            'response_sample' => $eligible->count(),
            'average_response_days' => $responseDays->isNotEmpty() ? round($responseDays->avg(), 1) : null,
            'response_time_sample' => $responseDays->count(),
            'average_stage_transition_days' => $transitionDays->isNotEmpty() ? round($transitionDays->avg(), 1) : null,
            'stage_transition_sample' => $transitionDays->count(),
            'outcomes' => $outcomeCounts,
            'rejection_stages' => $rejectionStages,
            'by_job_title' => $jobTitleCounts,
            'by_company' => $companyCounts,
            'by_source' => $sourceCounts,
        ]);
    }

    public function followUps(Request $request)
    {
        $followUps = FollowUp::with('application.company')
            ->whereHas('application.company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->orderBy('scheduled_at')
            ->paginate(max(1, min((int) $request->input('per_page', 30), 30)));

        return response()->json([
            'follow_ups' => $followUps->items(),
            'pagination' => [
                'current_page' => $followUps->currentPage(),
                'last_page' => $followUps->lastPage(),
                'total' => $followUps->total(),
            ],
        ]);
    }

    public function storeFollowUp(Request $request)
    {
        $data = $request->validate([
            'application_id' => 'required|integer',
            'scheduled_at' => 'required|date',
            'notes' => 'nullable|string|max:10000',
            'message_template' => 'nullable|string|max:10000',
        ]);

        $application = $this->ownedApplications($request)->whereKey($data['application_id'])->first();
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $followUp = $application->followUps()->create($data);

        return response()->json(['follow_up' => $followUp->load('application.company')], 201);
    }

    public function updateFollowUp(Request $request, int $id)
    {
        $followUp = $this->ownedFollowUps($request)->whereKey($id)->first();
        if (!$followUp) {
            return response()->json(['message' => 'Follow-up not found'], 404);
        }

        $data = $request->validate([
            'scheduled_at' => 'sometimes|required|date',
            'notes' => 'sometimes|nullable|string|max:10000',
            'message_template' => 'sometimes|nullable|string|max:10000',
        ]);
        $followUp->update($data);

        return response()->json(['follow_up' => $followUp->load('application.company')]);
    }

    public function completeFollowUp(Request $request, int $id)
    {
        $followUp = $this->ownedFollowUps($request)->whereKey($id)->first();
        if (!$followUp) {
            return response()->json(['message' => 'Follow-up not found'], 404);
        }
        $followUp->update(['completed_at' => now()]);

        return response()->json(['follow_up' => $followUp]);
    }

    public function skills(Request $request)
    {
        return response()->json([
            'skills' => UserSkill::where('user_id', $request->user()->id)->orderBy('name')->get(),
        ]);
    }

    public function storeSkill(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('user_skills', 'name')->where('user_id', $request->user()->id)],
            'status' => 'required|in:have_experience,learning,need_to_learn',
            'target_date' => 'nullable|date',
            'evidence_url' => 'nullable|url|max:255',
        ]);
        $skill = UserSkill::create($data + ['user_id' => $request->user()->id]);

        return response()->json(['skill' => $skill], 201);
    }

    public function updateSkill(Request $request, int $id)
    {
        $skill = UserSkill::where('user_id', $request->user()->id)->whereKey($id)->first();
        if (!$skill) {
            return response()->json(['message' => 'Skill not found'], 404);
        }
        $skill->update($request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('user_skills', 'name')->where('user_id', $request->user()->id)->ignore($skill->id)],
            'status' => 'sometimes|required|in:have_experience,learning,need_to_learn',
            'target_date' => 'sometimes|nullable|date',
            'evidence_url' => 'sometimes|nullable|url|max:255',
        ]));

        return response()->json(['skill' => $skill]);
    }

    public function deleteSkill(Request $request, int $id)
    {
        $deleted = UserSkill::where('user_id', $request->user()->id)->whereKey($id)->delete();
        return $deleted
            ? response()->json(['message' => 'Skill deleted'])
            : response()->json(['message' => 'Skill not found'], 404);
    }

    public function requirements(Request $request)
    {
        return response()->json([
            'requirements' => SavedJobRequirement::with('application.company')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get(),
        ]);
    }

    public function storeRequirement(Request $request)
    {
        $data = $this->validateRequirement($request);
        if (!$this->ownsOptionalApplication($request, $data['application_id'] ?? null)) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $requirement = SavedJobRequirement::create($data + ['user_id' => $request->user()->id]);

        return response()->json(['requirement' => $requirement], 201);
    }

    public function updateRequirement(Request $request, int $id)
    {
        $requirement = SavedJobRequirement::where('user_id', $request->user()->id)->whereKey($id)->first();
        if (!$requirement) {
            return response()->json(['message' => 'Saved job not found'], 404);
        }
        $data = $this->validateRequirement($request, true);
        $applicationId = $data['application_id'] ?? $requirement->application_id;
        if (!$this->ownsOptionalApplication($request, $applicationId)) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $requirement->update($data);

        return response()->json(['requirement' => $requirement]);
    }

    public function deleteRequirement(Request $request, int $id)
    {
        $deleted = SavedJobRequirement::where('user_id', $request->user()->id)->whereKey($id)->delete();
        return $deleted
            ? response()->json(['message' => 'Saved job deleted'])
            : response()->json(['message' => 'Saved job not found'], 404);
    }

    public function uploadDocument(Request $request, int $applicationId)
    {
        $application = $this->ownedApplications($request)->whereKey($applicationId)->first();
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $data = $request->validate([
            'type' => 'required|in:resume,job_description,other',
            'file' => 'required|file|mimes:pdf,doc,docx,txt|max:10240',
        ]);

        $file = $data['file'];
        $disk = 'local';
        $path = Storage::disk($disk)->putFile('application-documents', $file);
        if (!$path) {
            return response()->json(['message' => 'The document could not be stored.'], 500);
        }

        $document = $application->documents()->create([
            'type' => $data['type'],
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
            'disk' => $disk,
            'path' => $path,
        ]);

        return response()->json(['document' => $document], 201);
    }

    public function downloadDocument(Request $request, int $id)
    {
        $document = ApplicationDocument::whereKey($id)
            ->whereHas('application.company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->first();
        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        if (!Storage::disk($document->disk)->exists($document->path)) {
            return response()->json(['message' => 'Document file is missing'], 404);
        }

        return Storage::disk($document->disk)->download($document->path, $document->original_name, [
            'Content-Type' => $document->mime_type,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function deleteDocument(Request $request, int $id)
    {
        $document = ApplicationDocument::whereKey($id)
            ->whereHas('application.company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->first();
        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        if (!Storage::disk($document->disk)->delete($document->path)) {
            return response()->json(['message' => 'Document file could not be deleted'], 500);
        }
        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    public function storeResearchEntry(Request $request, int $companyId)
    {
        $company = Company::where('user_id', $request->user()->id)->whereKey($companyId)->first();
        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }
        $entry = $company->researchEntries()->create($request->validate([
            'category' => 'required|in:recruitment,interview,salary,note',
            'content' => 'required|string|max:10000',
            'source_url' => 'nullable|url|max:255',
            'source_date' => 'nullable|date',
        ]));

        return response()->json(['entry' => $entry], 201);
    }

    public function updateResearchEntry(Request $request, int $id)
    {
        $entry = CompanyResearchEntry::whereKey($id)
            ->whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->first();
        if (!$entry) {
            return response()->json(['message' => 'Research entry not found'], 404);
        }
        $entry->update($request->validate([
            'category' => 'sometimes|required|in:recruitment,interview,salary,note',
            'content' => 'sometimes|required|string|max:10000',
            'source_url' => 'sometimes|nullable|url|max:255',
            'source_date' => 'sometimes|nullable|date',
        ]));

        return response()->json(['entry' => $entry]);
    }

    public function deleteResearchEntry(Request $request, int $id)
    {
        $entry = CompanyResearchEntry::whereKey($id)
            ->whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->first();
        if (!$entry) {
            return response()->json(['message' => 'Research entry not found'], 404);
        }
        $entry->delete();

        return response()->json(['message' => 'Research entry deleted']);
    }

    private function ownedApplications(Request $request)
    {
        return Application::whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id));
    }

    private function ownedFollowUps(Request $request)
    {
        return FollowUp::whereHas('application.company', fn ($query) => $query->where('user_id', $request->user()->id));
    }

    private function ownsOptionalApplication(Request $request, ?int $applicationId): bool
    {
        return $applicationId === null
            || $this->ownedApplications($request)->whereKey($applicationId)->exists();
    }

    private function validateRequirement(Request $request, bool $sometimes = false): array
    {
        $prefix = $sometimes ? 'sometimes|' : '';
        $data = $request->validate([
            'application_id' => $prefix.'nullable|integer',
            'job_title' => $prefix.'required|string|max:255',
            'company_name' => $prefix.'nullable|string|max:255',
            'description' => $prefix.'nullable|string|max:50000',
            'required_skills' => $prefix.'required|array|max:200',
            'required_skills.*' => 'required|string|max:100',
        ]);
        if (array_key_exists('required_skills', $data)) {
            $data['required_skills'] = array_values(array_unique(array_filter(
                array_map('trim', $data['required_skills']),
                fn ($skill) => $skill !== ''
            )));
        }

        return $data;
    }

    private function rate(int $numerator, int $denominator): float
    {
        return $denominator === 0 ? 0 : round(($numerator / $denominator) * 100, 1);
    }
}
