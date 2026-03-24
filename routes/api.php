<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\VisitorController;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Employees
    Route::get('/employees/departments', [EmployeeController::class, 'departments']);
    Route::apiResource('employees', EmployeeController::class);

    // Appointments
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::apiResource('appointments', AppointmentController::class);

    // Visitors
    Route::patch('/visitors/{id}/checkout', [VisitorController::class, 'checkout']);
    Route::apiResource('visitors', VisitorController::class);
});

// Kiosk API (no auth — called from iPad app)
Route::prefix('kiosk')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/visitors', [VisitorController::class, 'store']);
    Route::get('/visitors/lookup', function (\Illuminate\Http\Request $request) {
        $query = \App\Models\Visitor::query();
        if ($phone = $request->get('phone')) {
            $query->where('phone', $phone);
        } elseif ($email = $request->get('email')) {
            $query->where('email', $email);
        } elseif ($name = $request->get('name')) {
            $query->where('name', 'like', "%{$name}%");
        }
        $visitor = $query->orderBy('check_in_time', 'desc')->first();
        $count = $visitor ? $query->count() : 0;
        return response()->json(['visitor' => $visitor, 'visit_count' => $count]);
    });
});
