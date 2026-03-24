<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Employee;
use App\Models\Visitor;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();

        // Today's appointment stats
        $todayAppointments = Appointment::whereDate('date', $today)->get();
        $appointmentStats = [
            'total' => $todayAppointments->count(),
            'confirmed' => $todayAppointments->where('status', 'confirmed')->count(),
            'scheduled' => $todayAppointments->where('status', 'scheduled')->count(),
            'in_progress' => $todayAppointments->where('status', 'in_progress')->count(),
            'completed' => $todayAppointments->where('status', 'completed')->count(),
            'cancelled' => $todayAppointments->where('status', 'cancelled')->count(),
            'no_show' => $todayAppointments->where('status', 'no_show')->count(),
        ];

        // Today's visitor stats
        $todayVisitors = Visitor::whereDate('check_in_time', $today)->get();
        $visitorStats = [
            'total' => $todayVisitors->count(),
            'checked_in' => $todayVisitors->where('status', 'checked_in')->count(),
            'waiting' => $todayVisitors->where('status', 'waiting')->count(),
            'in_meeting' => $todayVisitors->where('status', 'in_meeting')->count(),
            'checked_out' => $todayVisitors->where('status', 'checked_out')->count(),
        ];

        // Employee stats
        $employeeStats = [
            'total' => Employee::count(),
            'active' => Employee::where('is_active', true)->count(),
        ];

        // All-time stats
        $allTimeStats = [
            'total_appointments' => Appointment::count(),
            'total_visitors' => Visitor::count(),
        ];

        // Recent appointments (last 5)
        $recentAppointments = Appointment::with('employee')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent visitors (last 5)
        $recentVisitors = Visitor::with('hostEmployee')
            ->orderBy('check_in_time', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'appointments' => $appointmentStats,
            'visitors' => $visitorStats,
            'employees' => $employeeStats,
            'all_time' => $allTimeStats,
            'recent_appointments' => $recentAppointments,
            'recent_visitors' => $recentVisitors,
        ]);
    }
}
