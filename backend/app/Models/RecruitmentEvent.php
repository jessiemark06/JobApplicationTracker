<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentEvent extends Model
{
    protected $fillable = [
        'user_id',
        'application_id',
        'event_type',
        'starts_at',
        'ends_at',
        'timezone',
        'mode',
        'location',
        'contact_name',
        'contact_email',
        'preparation_notes',
        'required_documents',
        'status',
        'outcome',
        'event_notes',
        'reminder_intervals',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'required_documents' => 'array',
            'reminder_intervals' => 'array',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function histories()
    {
        return $this->hasMany(RecruitmentEventHistory::class)->latest();
    }
}
