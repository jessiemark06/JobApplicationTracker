<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'companies' => Company::where('user_id', $request->user()->id)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string',
            'application_instructions' => 'nullable|string|max:10000',
            'recruitment_notes' => 'nullable|string|max:10000',
        ]);
        $company = Company::create($data + ['user_id' => $request->user()->id]);

        return response()->json([
            'message' => 'Job application created successfully',
            'company' => $company,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $company = Company::where('user_id', $request->user()->id)
            ->whereKey($id)
            ->with([
                'applications' => fn ($query) => $query->with('statusHistory')->latest(),
                'researchEntries',
            ])
            ->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        return response()->json(['company' => $company]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string',
            'application_instructions' => 'nullable|string|max:10000',
            'recruitment_notes' => 'nullable|string|max:10000',
        ]);
        $company = Company::where('user_id', $request->user()->id)->whereKey($id)->first();

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $company->update($data);

        return response()->json([
            'message' => 'Job application updated successfully',
            'company' => $company,
        ], 201);
    }

    public function delete(Request $request, int $id)
    {
        $company = Company::where('user_id', $request->user()->id)
            ->with('applications.documents')
            ->whereKey($id)
            ->first();
        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        foreach ($company->applications as $application) {
            foreach ($application->documents as $document) {
                $disk = Storage::disk($document->disk);
                if ($disk->exists($document->path) && !$disk->delete($document->path)) {
                    return response()->json(['message' => 'A company application document could not be deleted'], 500);
                }
            }
        }

        $company->delete();

        return response()->json(['message' => 'Company deleted successfully']);
    }
}
