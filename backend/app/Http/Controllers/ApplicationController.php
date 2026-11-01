<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationStatusHistory;
use App\Models\Company;
use App\Services\UserNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $applications = Application::with('company')
            ->whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id))
            ->latest('applied_at')
            ->paginate(max(1, min((int) $request->input('per_page', 30), 30)));

        return response()->json([
            'applications' => $applications->items(),
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedApplication($request);
        $company = Company::where('id', $data['company_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $statusNote = $data['status_note'] ?? null;
        unset($data['status_note']);
        $application = DB::transaction(function () use ($data, $statusNote) {
            $application = Application::create($data);
            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'new_status' => $application->status,
                'notes' => $statusNote,
                'recorded_at' => now(),
            ]);

            return $application;
        });

        $application->load('company');

        return response()->json([
            'message' => 'Application created successfully',
            'application' => $application,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $application = $this->ownedApplications($request)
            ->with(['company', 'statusHistory', 'documents', 'recruitmentEvents.histories'])
            ->whereKey($id)
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        return response()->json(['application' => $application]);
    }

    public function update(Request $request, int $id)
    {
        $data = $this->validatedApplication($request);
        $application = $this->ownedApplications($request)->whereKey($id)->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $company = Company::where('id', $data['company_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }
        $ownerId = $company->user_id;

        $statusNote = $data['status_note'] ?? null;
        unset($data['status_note']);
        $statusNotification = null;
        DB::transaction(function () use ($application, $data, $statusNote, $ownerId, &$statusNotification) {
            $previousStatus = $application->status;
            $application->update($data);

            if ($previousStatus !== $application->status) {
                ApplicationStatusHistory::create([
                    'application_id' => $application->id,
                    'previous_status' => $previousStatus,
                    'new_status' => $application->status,
                    'notes' => $statusNote,
                    'recorded_at' => now(),
                ]);
                $statusNotification = app(UserNotificationService::class)->create(
                    $ownerId,
                    'application_update',
                    $application->status === 'Offer' ? 'Offer status recorded' : 'Application status updated',
                    "{$application->job_title} status changed from {$previousStatus} to {$application->status}.",
                    $application->id,
                    null,
                    '/applications/view/'.$application->id,
                );
            }
        });
        if ($statusNotification) {
            app(UserNotificationService::class)->sendOptionalEmail(
                $statusNotification,
                $request->user(),
                'email_application_updates',
            );
        }

        $application->load('company', 'statusHistory');

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => $application,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $application = $this->ownedApplications($request)->with('documents')->whereKey($id)->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        foreach ($application->documents as $document) {
            $disk = Storage::disk($document->disk);
            if ($disk->exists($document->path) && !$disk->delete($document->path)) {
                return response()->json(['message' => 'An application document could not be deleted'], 500);
            }
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }

    private function ownedApplications(Request $request)
    {
        return Application::whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id));
    }

    private function validatedApplication(Request $request): array
    {
        return $request->validate([
            'company_id' => 'required|integer|exists:companies,id',
            'job_title' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'status_note' => 'nullable|string|max:10000',
            'applied_at' => 'nullable|date',
            'job_url' => 'nullable|url|max:255',
            'source' => 'nullable|string|max:255',
            'job_description' => 'nullable|string',
            'contact_name' => 'nullable|string|max:255',
            'contact_role' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);
    }
}
