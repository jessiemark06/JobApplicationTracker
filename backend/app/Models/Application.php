<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'job_title',
        'status',
        'applied_at',
        'job_url',
        'source',
        'job_description',
        'contact_name',
        'contact_role',
        'contact_email',
        'contact_phone',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderBy('recorded_at');
    }

    public function followUps()
    {
        return $this->hasMany(FollowUp::class);
    }

    public function documents()
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function recruitmentEvents()
    {
        return $this->hasMany(RecruitmentEvent::class)->orderBy('starts_at');
    }
}