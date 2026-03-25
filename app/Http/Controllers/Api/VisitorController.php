<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $query = Visitor::with('hostEmployee');

        if ($request->boolean('today')) {
            $query->whereDate('check_in_time', today());
        }

        if ($date = $request->get('date')) {
            $query->whereDate('check_in_time', $date);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('badge_number', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $visitors = $query->orderBy('check_in_time', 'desc')
            ->paginate($request->get('per_page', 25));

        return response()->json($visitors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'purpose' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'check_in_time' => 'required|date',
            'host_employee_id' => 'nullable|uuid',
            'status' => 'sometimes|in:checked_in,waiting,in_meeting,checked_out,cancelled',
            'badge_number' => 'nullable|string|max:20',
        ]);

        // Resolve host_employee_id — kiosk may send a local UUID that doesn't exist in DB
        if (!empty($validated['host_employee_id'])) {
            $employee = \App\Models\Employee::find($validated['host_employee_id']);
            if (!$employee) {
                $validated['host_employee_id'] = null;
            }
        }

        $visitor = Visitor::create($validated);

        return response()->json($visitor->load('hostEmployee'), 201);
    }

    public function show(string $id)
    {
        $visitor = Visitor::with('hostEmployee')->findOrFail($id);
        return response()->json($visitor);
    }

    public function update(Request $request, string $id)
    {
        $visitor = Visitor::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'company' => 'nullable|string|max:255',
            'purpose' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'status' => 'sometimes|in:checked_in,waiting,in_meeting,checked_out,cancelled',
            'check_out_time' => 'nullable|date',
        ]);

        $visitor->update($validated);

        return response()->json($visitor->load('hostEmployee'));
    }

    public function destroy(string $id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->delete();

        return response()->json(['message' => 'Visitor deleted']);
    }

    public function checkout(string $id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->update([
            'status' => 'checked_out',
            'check_out_time' => now(),
        ]);

        return response()->json($visitor->load('hostEmployee'));
    }
}
