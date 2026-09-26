<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{ 
    public function index()
    {
        $applications = Application::with('company')->get();

        return response()->json([
            'applications' => $applications
        ]);
    }
 
    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'job_title' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'applied_at' => 'nullable|date',
            'job_url' => 'nullable|url|max:255',
            'contact_name' => 'nullable|string|max:255',
            'contact_role' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $application = Application::create($request->all());
        $application->load('company');

        return response()->json([
            'message' => 'Application created successfully',
            'application' => $application
        ], 201);
    }
 
    public function show($id)
    {
        $application = Application::with('company')->findOrFail($id);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        return response()->json([
            'application' => $application
        ]);
    }
 
    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found',
                'application' => $application
            ], 404);
        }

        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'job_title' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'applied_at' => 'nullable|date',
            'job_url' => 'nullable|url|max:255',
            'contact_name' => 'nullable|string|max:255',
            'contact_role' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $application->update([
            'company_id' => $request->company_id,
            'job_title' => $request->job_title,
            'status' => $request->status,
            'applied_at' => $request->applied_at,
            'job_url' => $request->job_url,
            'contact_name' => $request->contact_name,
            'contact_role' => $request->contact_role,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'notes' => $request->notes,
        ]);

        $application->load('company');

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => $application
        ]);
    }
 
    public function destroy($id)
    {
        $application = Application::findorfail($id);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        $application->delete();

        return response()->json([
            'message' => 'Application deleted successfully'
        ]);
    }
}