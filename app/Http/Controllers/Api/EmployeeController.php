<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($department = $request->get('department')) {
            $query->where('department', $department);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $employees = $query->orderBy('name')->get();

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'department' => 'required|string|max:100',
            'designation' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $employee = Employee::create($validated);

        return response()->json($employee, 201);
    }

    public function show(string $id)
    {
        $employee = Employee::with(['appointments' => function ($q) {
            $q->orderBy('start_time', 'desc')->limit(10);
        }])->findOrFail($id);

        return response()->json($employee);
    }

    public function update(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'department' => 'sometimes|string|max:100',
            'designation' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $employee->update($validated);

        return response()->json($employee);
    }

    public function destroy(string $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        return response()->json(['message' => 'Employee deleted']);
    }

    public function departments()
    {
        $departments = Employee::select('department')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        return response()->json($departments);
    }
}
