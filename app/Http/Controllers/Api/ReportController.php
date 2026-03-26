<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Employee;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function stats(Request $request)
    {
        $from = Carbon::parse($request->get('from', now()->subDays(29)->toDateString()))->startOfDay();
        $to = Carbon::parse($request->get('to', now()->toDateString()))->endOfDay();

        $appointments = Appointment::whereBetween('date', [$from, $to])->get();
        $visitors = Visitor::whereBetween('check_in_time', [$from, $to])->get();

        // --- Daily trend ---
        $dailyTrend = [];
        $cursor = $from->copy();
        while ($cursor->lte($to)) {
            $day = $cursor->toDateString();
            $dailyTrend[] = [
                'date' => $day,
                'appointments' => $appointments->filter(fn ($a) => Carbon::parse($a->date)->toDateString() === $day)->count(),
                'visitors' => $visitors->filter(fn ($v) => Carbon::parse($v->check_in_time)->toDateString() === $day)->count(),
            ];
            $cursor->addDay();
        }

        // --- Status breakdown (appointments) ---
        $statusBreakdown = $appointments->groupBy('status')->map->count()->toArray();

        // --- Created-via breakdown ---
        $createdVia = $appointments->groupBy('created_via')->map->count()->toArray();

        // --- Top employees by appointment count ---
        $topEmployees = $appointments->groupBy('employee_name')
            ->map(function ($group, $name) {
                return [
                    'name' => $name,
                    'total' => $group->count(),
                    'completed' => $group->where('status', 'completed')->count(),
                    'cancelled' => $group->where('status', 'cancelled')->count(),
                    'no_show' => $group->where('status', 'no_show')->count(),
                ];
            })
            ->values()
            ->sortByDesc('total')
            ->take(10)
            ->values()
            ->toArray();

        // --- Top companies ---
        $topCompanies = $visitors
            ->filter(fn ($v) => !empty($v->company))
            ->groupBy('company')
            ->map->count()
            ->sortDesc()
            ->take(10)
            ->toArray();

        // --- Department breakdown ---
        $deptBreakdown = $appointments
            ->filter(fn ($a) => !empty($a->employee_id))
            ->groupBy('employee_id')
            ->map(function ($group) {
                $employee = Employee::find($group->first()->employee_id);
                return [
                    'department' => $employee ? $employee->department : 'Unknown',
                    'count' => $group->count(),
                ];
            })
            ->groupBy('department')
            ->map(fn ($group) => $group->sum('count'))
            ->sortDesc()
            ->toArray();

        // --- Hourly heatmap (hour of day vs day of week) ---
        $hourlyData = [];
        foreach ($appointments as $a) {
            $startTime = Carbon::parse($a->start_time);
            $hour = $startTime->hour;
            $dayOfWeek = Carbon::parse($a->date)->dayOfWeek; // 0=Sun,6=Sat
            $key = "{$dayOfWeek}-{$hour}";
            $hourlyData[$key] = ($hourlyData[$key] ?? 0) + 1;
        }

        // --- Returning vs first-time visitors ---
        $visitorPhones = $visitors->pluck('phone')->filter()->unique();
        $returningCount = 0;
        foreach ($visitorPhones as $phone) {
            $totalVisits = Visitor::where('phone', $phone)->count();
            if ($totalVisits > 1) {
                $returningCount += $visitors->where('phone', $phone)->count();
            }
        }
        $firstTimeCount = $visitors->count() - $returningCount;

        // --- Average visit duration (minutes) ---
        $completedVisitors = $visitors->filter(fn ($v) => !empty($v->check_out_time));
        $avgDuration = 0;
        if ($completedVisitors->count() > 0) {
            $totalMinutes = $completedVisitors->sum(function ($v) {
                return Carbon::parse($v->check_out_time)->diffInMinutes(Carbon::parse($v->check_in_time));
            });
            $avgDuration = round($totalMinutes / $completedVisitors->count());
        }

        // --- Summary stats ---
        $totalDays = max(1, $from->diffInDays($to) + 1);
        $summary = [
            'total_appointments' => $appointments->count(),
            'total_visitors' => $visitors->count(),
            'avg_appointments_per_day' => round($appointments->count() / $totalDays, 1),
            'avg_visitors_per_day' => round($visitors->count() / $totalDays, 1),
            'completion_rate' => $appointments->count() > 0
                ? round($appointments->where('status', 'completed')->count() / $appointments->count() * 100, 1)
                : 0,
            'cancellation_rate' => $appointments->count() > 0
                ? round($appointments->where('status', 'cancelled')->count() / $appointments->count() * 100, 1)
                : 0,
            'no_show_rate' => $appointments->count() > 0
                ? round($appointments->where('status', 'no_show')->count() / $appointments->count() * 100, 1)
                : 0,
            'avg_visit_duration_min' => $avgDuration,
        ];

        // --- Busiest hour ---
        $hourlyCounts = $appointments->groupBy(fn ($a) => Carbon::parse($a->start_time)->hour)->map->count();
        $busiestHour = $hourlyCounts->count() > 0 ? $hourlyCounts->sortDesc()->keys()->first() : null;
        $summary['busiest_hour'] = $busiestHour !== null ? sprintf('%02d:00', $busiestHour) : null;

        return response()->json([
            'summary' => $summary,
            'daily_trend' => $dailyTrend,
            'status_breakdown' => $statusBreakdown,
            'created_via' => $createdVia,
            'top_employees' => $topEmployees,
            'top_companies' => $topCompanies,
            'department_breakdown' => $deptBreakdown,
            'hourly_heatmap' => $hourlyData,
            'visitor_type' => [
                'returning' => $returningCount,
                'first_time' => $firstTimeCount,
            ],
        ]);
    }

    public function exportCsv(Request $request)
    {
        $type = $request->get('type', 'appointments');
        $from = Carbon::parse($request->get('from', now()->subDays(29)->toDateString()))->startOfDay();
        $to = Carbon::parse($request->get('to', now()->toDateString()))->endOfDay();

        if ($type === 'visitors') {
            $records = Visitor::with('hostEmployee')
                ->whereBetween('check_in_time', [$from, $to])
                ->orderBy('check_in_time', 'desc')
                ->get();

            $csv = "Name,Company,Purpose,Phone,Email,Host,Badge,Status,Check-in,Check-out\n";
            foreach ($records as $v) {
                $csv .= sprintf(
                    "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    str_replace('"', '""', $v->name ?? ''),
                    str_replace('"', '""', $v->company ?? ''),
                    str_replace('"', '""', $v->purpose ?? ''),
                    $v->phone ?? '',
                    $v->email ?? '',
                    $v->hostEmployee->name ?? '',
                    $v->badge_number ?? '',
                    $v->status ?? '',
                    $v->check_in_time ?? '',
                    $v->check_out_time ?? '',
                );
            }
        } else {
            $records = Appointment::with('employee')
                ->whereBetween('date', [$from, $to])
                ->orderBy('date', 'desc')
                ->orderBy('start_time', 'desc')
                ->get();

            $csv = "Visitor,Company,Purpose,Phone,Employee,Date,Start,End,Room,Badge,Status,Created Via\n";
            foreach ($records as $a) {
                $csv .= sprintf(
                    "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    str_replace('"', '""', $a->visitor_name ?? ''),
                    str_replace('"', '""', $a->visitor_company ?? ''),
                    str_replace('"', '""', $a->visitor_purpose ?? ''),
                    $a->visitor_phone ?? '',
                    $a->employee_name ?? '',
                    $a->date ? Carbon::parse($a->date)->toDateString() : '',
                    $a->start_time ?? '',
                    $a->end_time ?? '',
                    $a->meeting_room ?? '',
                    $a->badge_number ?? '',
                    $a->status ?? '',
                    $a->created_via ?? '',
                );
            }
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$type}_report.csv",
        ]);
    }
}
