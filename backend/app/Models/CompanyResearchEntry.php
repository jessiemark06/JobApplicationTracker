<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyResearchEntry extends Model
{
    protected $fillable = ['company_id', 'category', 'content', 'source_url', 'source_date'];

    protected function casts(): array
    {
        return ['source_date' => 'date'];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
