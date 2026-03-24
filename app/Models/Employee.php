<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'email', 'phone', 'department',
        'designation', 'floor', 'photo', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function visitors()
    {
        return $this->hasMany(Visitor::class, 'host_employee_id');
    }

    public function getMaskedEmailAttribute(): string
    {
        $parts = explode('@', $this->email);
        if (count($parts) !== 2) return $this->email;
        $name = $parts[0];
        $masked = substr($name, 0, 1) . str_repeat('.', max(1, strlen($name) - 2)) . substr($name, -1);
        return $masked . '@' . $parts[1];
    }

    public function getFirstNameAttribute(): string
    {
        return explode(' ', $this->name)[0];
    }
}
