<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Visitor extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'company', 'purpose', 'phone', 'email',
        'check_in_time', 'check_out_time',
        'host_employee_id', 'status',
        'badge_number', 'photo',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    public function hostEmployee()
    {
        return $this->belongsTo(Employee::class, 'host_employee_id');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('check_in_time', today());
    }

    public function scopeCheckedIn($query)
    {
        return $query->where('status', 'checked_in');
    }
}
