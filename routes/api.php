<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\VisitorController;
use App\Http\Controllers\Api\ReportController;

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

    // Reports
    Route::get('/reports/stats', [ReportController::class, 'stats']);
    Route::get('/reports/export', [ReportController::class, 'exportCsv']);
});

// Debug: check filesystem (TEMPORARY - remove after fixing)
Route::get('/debug/static-files', function () {
    $publicPath = public_path();
    $staticPath = public_path('static');
    $result = [
        'public_path' => $publicPath,
        'static_exists' => is_dir($staticPath),
        'index_html_exists' => file_exists(public_path('index.html')),
    ];
    if (is_dir($staticPath . '/js')) {
        $result['js_files'] = scandir($staticPath . '/js');
    }
    if (is_dir($staticPath . '/css')) {
        $result['css_files'] = scandir($staticPath . '/css');
    }
    // Also check if frontend/build exists
    $result['frontend_build_exists'] = is_dir(base_path('frontend/build'));
    if (is_dir(base_path('frontend/build/static/js'))) {
        $result['frontend_build_js'] = scandir(base_path('frontend/build/static/js'));
    }
    return response()->json($result, 200, [], JSON_PRETTY_PRINT);
});

// Kiosk API (no auth — called from iPad app)
Route::prefix('kiosk')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/visitors', [VisitorController::class, 'store']);

    // Lookup returning visitor by phone/email/name
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

    // Get next badge number (atomic increment)
    Route::get('/badge/next', function () {
        $lastVisitor = \App\Models\Visitor::orderByRaw("CAST(SUBSTRING(badge_number, 3) AS UNSIGNED) DESC")->first();
        $nextNum = 1;
        if ($lastVisitor && $lastVisitor->badge_number) {
            $num = intval(substr($lastVisitor->badge_number, 2));
            $nextNum = $num + 1;
        }
        $badge = sprintf('V-%04d', $nextNum);
        return response()->json(['badge_number' => $badge]);
    });

    // Lookup appointments by visitor name (for confirm/reschedule/cancel)
    Route::get('/appointments/lookup', function (\Illuminate\Http\Request $request) {
        $name = $request->get('visitor_name', '');
        $appointments = \App\Models\Appointment::where('visitor_name', 'like', "%{$name}%")
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();
        return response()->json($appointments);
    });

    // Update appointment status (for confirm/cancel from kiosk)
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

    // Update visitor record (for photo upload etc)
    Route::patch('/visitors/{id}', [VisitorController::class, 'update']);
});
