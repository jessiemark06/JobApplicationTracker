<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowUp extends Model
{
    protected $fillable = ['application_id', 'scheduled_at', 'completed_at', 'notes', 'message_template'];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
