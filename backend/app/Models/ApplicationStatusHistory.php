<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationStatusHistory extends Model
{
    protected $fillable = [
        'application_id',
        'previous_status',
        'new_status',
        'notes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return ['recorded_at' => 'datetime'];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
