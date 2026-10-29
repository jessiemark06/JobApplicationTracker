<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentEventHistory extends Model
{
    protected $fillable = ['recruitment_event_id', 'action', 'previous_values', 'new_values'];

    protected function casts(): array
    {
        return ['previous_values' => 'array', 'new_values' => 'array'];
    }

    public function event()
    {
        return $this->belongsTo(RecruitmentEvent::class, 'recruitment_event_id');
    }
}
