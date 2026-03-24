<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Appointment extends Model
{
    use HasUuids;

    protected $fillable = [
        'visitor_name', 'visitor_company', 'visitor_purpose',
        'visitor_phone', 'visitor_email',
        'employee_id', 'employee_name', 'employee_email',
        'date', 'start_time', 'end_time',
        'status', 'meeting_room', 'google_event_id',
        'badge_number', 'created_via', 'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'completed']);
    }
}
