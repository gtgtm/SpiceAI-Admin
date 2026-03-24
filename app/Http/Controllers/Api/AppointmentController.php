<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with('employee');

        if ($date = $request->get('date')) {
            $query->whereDate('date', $date);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($employeeId = $request->get('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                  ->orWhere('visitor_company', 'like', "%{$search}%")
                  ->orWhere('employee_name', 'like', "%{$search}%")
                  ->orWhere('badge_number', 'like', "%{$search}%");
            });
        }

        $sort = $request->get('sort', 'start_time');
        $order = $request->get('order', 'desc');
        $query->orderBy($sort, $order);

        $appointments = $query->paginate($request->get('per_page', 25));

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitor_name' => 'required|string|max:255',
            'visitor_company' => 'nullable|string|max:255',
            'visitor_purpose' => 'nullable|string|max:255',
            'visitor_phone' => 'nullable|string|max:20',
            'visitor_email' => 'nullable|email|max:255',
            'employee_id' => 'required|uuid|exists:employees,id',
            'date' => 'required|date',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'sometimes|in:scheduled,confirmed,in_progress,completed,cancelled,rescheduled,no_show',
            'meeting_room' => 'nullable|string|max:100',
            'created_via' => 'sometimes|in:voice_kiosk,manual,walk_in',
            'notes' => 'nullable|string',
        ]);

        // Auto-fill employee info
        $employee = \App\Models\Employee::findOrFail($validated['employee_id']);
        $validated['employee_name'] = $employee->name;
        $validated['employee_email'] = $employee->email;
        $validated['created_via'] = $validated['created_via'] ?? 'manual';

        $appointment = Appointment::create($validated);

        return response()->json($appointment->load('employee'), 201);
    }

    public function show(string $id)
    {
        $appointment = Appointment::with('employee')->findOrFail($id);
        return response()->json($appointment);
    }

    public function update(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'visitor_name' => 'sometimes|string|max:255',
            'visitor_company' => 'nullable|string|max:255',
            'visitor_purpose' => 'nullable|string|max:255',
            'visitor_phone' => 'nullable|string|max:20',
            'visitor_email' => 'nullable|email|max:255',
            'date' => 'sometimes|date',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date',
            'status' => 'sometimes|in:scheduled,confirmed,in_progress,completed,cancelled,rescheduled,no_show',
            'meeting_room' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json($appointment->load('employee'));
    }

    public function destroy(string $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted']);
    }

    public function updateStatus(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:scheduled,confirmed,in_progress,completed,cancelled,rescheduled,no_show',
        ]);

        $appointment->update($validated);

        return response()->json($appointment->load('employee'));
    }
}
