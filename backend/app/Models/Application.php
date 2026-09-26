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
}