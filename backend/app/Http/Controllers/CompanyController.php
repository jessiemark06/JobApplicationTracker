<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'companies' => Company::where('user_id', $request->user()->id)->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|max:255',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string',
        ]);

         $company = Company::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'location' => $request->location,
            'website' => $request->website,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Job application created successfully',
            'company' => $company
        ], 201);
    }

    public function show(Request $request, $id)
    {
       $company = Company::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

        if (!$company) {
            return response()->json([
                'message' => 'Company not found'
            ], 404);
        }

        return response()->json([
            'company' => $company
        ]);
    }

    public function update(Request $request, $id){
         $request->validate([
          'name' => 'required|string|max:255',
            'location' => 'required|max:255',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string',
        ]);

          $company = Company::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$company) {
            return response()->json([
                'message' => 'Company not found'
            ], 404);
        }

        $company->update([
            'name'=>$request->name,
            'location'=>$request->location,
            'website'=>$request->website,
            'notes'=>$request->notes,
        ]);

        return response()->json([
            'message'=>'Job application updated successfully',
            'company'=>$company
        ],201);
    }

   public function delete(Request $request, $id)
{
    $company = Company::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$company) {
        return response()->json([
            'message' => 'Company not found'
        ], 404);
    }

    $company->delete();

    return response()->json([
        'message' => 'Company deleted successfully'
    ]);
}

}