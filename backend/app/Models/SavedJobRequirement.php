<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedJobRequirement extends Model
{
    protected $fillable = ['user_id', 'application_id', 'job_title', 'company_name', 'description', 'required_skills'];

    protected function casts(): array
    {
        return ['required_skills' => 'array'];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
