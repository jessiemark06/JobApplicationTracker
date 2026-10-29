<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    protected $fillable = [
        'user_id',
        'recruitment_event_id',
        'application_id',
        'type',
        'title',
        'message',
        'destination',
        'dedupe_key',
        'email_status',
        'email_attempted_at',
        'email_error',
        'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime', 'email_attempted_at' => 'datetime'];
    }

    public function event()
    {
        return $this->belongsTo(RecruitmentEvent::class, 'recruitment_event_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
