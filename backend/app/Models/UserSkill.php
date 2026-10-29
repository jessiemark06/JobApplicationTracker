<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSkill extends Model
{
    protected $fillable = ['user_id', 'name', 'status', 'target_date', 'evidence_url'];

    protected function casts(): array
    {
        return ['target_date' => 'date'];
    }
}
