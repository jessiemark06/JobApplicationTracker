<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
        protected $fillable = [
            'user_id',
            'name', 
            'notes',
            'website',
            'location',
            'application_instructions',
            'recruitment_notes',
        ];

    public function applications(){
        return $this->hasMany(Application::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function researchEntries()
    {
        return $this->hasMany(CompanyResearchEntry::class)->latest();
    }
}
