<?php

namespace App\Http\Controllers;

use App\Models\Agreement;
use App\Models\RecruitmentEvent;
use App\Models\SavedJobRequirement;
use App\Models\UserSkill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PrivacyController extends Controller
{
    public function agreements()
    {
        return response()->json([
            'agreements' => Agreement::query()
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->orderBy('slug')
                ->orderByDesc('published_at')
                ->get()
                ->unique('slug')
                ->values(),
        ]);
    }

    public function consents(Request $request)
    {
        return response()->json([
            'consents' => $request->user()->userAgreements()
                ->with('agreement')
                ->latest('accepted_at')
                ->get()
                ->map(fn ($consent) => [
                    'id' => $consent->id,
                    'agreement' => $consent->agreement->only(['slug', 'version', 'title']),
                    'accepted_at' => $consent->accepted_at,
                    'revoked_at' => $consent->revoked_at,
                ]),
        ]);
    }

    public function accept(Request $request)
    {
        $data = $request->validate([
            'agreement_slugs' => ['required', 'array', 'min:1'],
            'agreement_slugs.*' => ['string', 'distinct'],
        ]);

        $agreements = Agreement::query()
            ->whereIn('slug', $data['agreement_slugs'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get()
            ->keyBy('slug');

        if ($agreements->count() !== count($data['agreement_slugs'])) {
            return response()->json(['message' => 'One or more agreements are unavailable.'], 422);
        }

        foreach ($agreements as $agreement) {
            $request->user()->userAgreements()->updateOrCreate(
                ['agreement_id' => $agreement->id],
                [
                    'accepted_at' => now(),
                    'revoked_at' => null,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ],
            );
        }

        return response()->json(['message' => 'Agreements accepted successfully.']);
    }

    public function export(Request $request)
    {
        $user = $request->user()->load([
            'companies.applications.documents',
            'companies.applications.statusHistory',
            'companies.applications.followUps',
            'userAgreements.agreement',
        ]);

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'profile' => $user->only(['id', 'name', 'email', 'email_verified_at', 'timezone', 'notification_preferences', 'created_at']),
            'companies' => $user->companies,
            'agreements' => $user->userAgreements->map(fn ($consent) => [
                'agreement' => $consent->agreement->only(['slug', 'version', 'title']),
                'accepted_at' => $consent->accepted_at,
                'revoked_at' => $consent->revoked_at,
            ]),
        ]);
    }

    public function destroyAccount(Request $request)
    {
        $data = $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        $userId = $user->id;
        $user->load('companies.applications.documents');

        DB::transaction(function () use ($user, $userId) {
            foreach ($user->companies as $company) {
                foreach ($company->applications as $application) {
                    foreach ($application->documents as $document) {
                        Storage::disk($document->disk)->delete($document->path);
                    }
                }
            }

            RecruitmentEvent::where('user_id', $userId)->delete();
            UserSkill::where('user_id', $userId)->delete();
            SavedJobRequirement::where('user_id', $userId)->delete();
            $user->userAgreements()->delete();
            $user->companies()->delete();
            $user->tokens()->delete();
            $user->name = 'Deleted user';
            $user->email = "deleted-{$userId}@invalid.local";
            $user->password = bin2hex(random_bytes(32));
            $user->notification_preferences = null;
            $user->timezone = null;
            $user->email_verified_at = null;
            $user->save();
            $user->delete();
        });

        return response()->json(['message' => 'Your account and personal data have been deleted.']);
    }
}
