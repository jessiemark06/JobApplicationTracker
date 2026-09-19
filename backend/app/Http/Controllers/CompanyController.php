<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index()
    {
        return response()->json([
            'companies' => Company::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $company = Company::create($request->all());

        return response()->json([
            'message' => 'Job application created successfully',
            'company' => $company
        ], 201);
    }

    public function show($id)
    {
        $company = Company::findorfail($id);
     
        return response()->json([
            'company' =>$company
        ], 201);
    }

    public function update(Request $request, $id){
         $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $company= Company::findorfail($id);
        $company->update([
            'name'=>$request->name,
            'email'=>$request->email,
            'website'=>$request->website
        ]);

        return response()->json([
            'message'=>'Job application updated successfully',
            'company'=>$company
        ],201);
    }

    public function delete($id)
    {
        $company = Company::findorfail($id);
        $company->delete();

        return response()->json([
            'message'=>'Job application deleted successfully',
            'company'=>$company
        ],201);
    }

}