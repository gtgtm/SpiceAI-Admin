<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Appointment;
use App\Models\Visitor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if already seeded
        if (User::where('email', 'admin@spicejet.com')->exists()) {
            return;
        }

        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@spicejet.com',
            'password' => Hash::make('admin123'),
        ]);

        // Sample employees
        $employees = [
            ['name' => 'Gautam Tekwani', 'email' => 'gautam@spicejet.com', 'phone' => '9876543210', 'department' => 'Technology', 'designation' => 'Senior Developer', 'floor' => '3'],
            ['name' => 'Priya Sharma', 'email' => 'priya.sharma@spicejet.com', 'phone' => '9876543211', 'department' => 'Human Resources', 'designation' => 'HR Manager', 'floor' => '2'],
            ['name' => 'Rajesh Kumar', 'email' => 'rajesh.kumar@spicejet.com', 'phone' => '9876543212', 'department' => 'Finance', 'designation' => 'Finance Head', 'floor' => '4'],
            ['name' => 'Anita Desai', 'email' => 'anita.desai@spicejet.com', 'phone' => '9876543213', 'department' => 'Operations', 'designation' => 'Ops Manager', 'floor' => '1'],
            ['name' => 'Vikram Singh', 'email' => 'vikram.singh@spicejet.com', 'phone' => '9876543214', 'department' => 'Technology', 'designation' => 'CTO', 'floor' => '5'],
            ['name' => 'Meena Patel', 'email' => 'meena.patel@spicejet.com', 'phone' => '9876543215', 'department' => 'Marketing', 'designation' => 'Marketing Lead', 'floor' => '2'],
            ['name' => 'Suresh Nair', 'email' => 'suresh.nair@spicejet.com', 'phone' => '9876543216', 'department' => 'Legal', 'designation' => 'Legal Counsel', 'floor' => '4'],
            ['name' => 'Deepa Menon', 'email' => 'deepa.menon@spicejet.com', 'phone' => '9876543217', 'department' => 'Human Resources', 'designation' => 'Recruiter', 'floor' => '2'],
        ];

        $createdEmployees = [];
        foreach ($employees as $emp) {
            $createdEmployees[] = Employee::create($emp);
        }

        // Sample appointments for today
        $today = now()->toDateString();
        $rooms = ['Conference Room A', 'Conference Room B', 'HR Cabin', 'Meeting Room C', 'Board Room'];

        $sampleAppointments = [
            ['visitor_name' => 'Rahul Sharma', 'visitor_company' => 'TCS', 'visitor_purpose' => 'Project Discussion', 'visitor_phone' => '9123456789', 'employee_idx' => 0, 'hour' => 10, 'status' => 'confirmed'],
            ['visitor_name' => 'Meera Joshi', 'visitor_company' => 'Infosys', 'visitor_purpose' => 'Interview', 'visitor_phone' => '9234567890', 'employee_idx' => 1, 'hour' => 11, 'status' => 'scheduled'],
            ['visitor_name' => 'Suresh Kumar', 'visitor_company' => 'Wipro', 'visitor_purpose' => 'Vendor Meeting', 'visitor_phone' => '9345678901', 'employee_idx' => 2, 'hour' => 14, 'status' => 'scheduled'],
            ['visitor_name' => 'Kavita Reddy', 'visitor_company' => 'HCL', 'visitor_purpose' => 'Partnership Discussion', 'visitor_phone' => null, 'employee_idx' => 4, 'hour' => 15, 'status' => 'confirmed'],
            ['visitor_name' => 'Amit Patel', 'visitor_company' => 'Deloitte', 'visitor_purpose' => 'Audit', 'visitor_phone' => null, 'employee_idx' => 2, 'hour' => 16, 'status' => 'scheduled'],
        ];

        $badgeCounter = 0;
        foreach ($sampleAppointments as $apt) {
            $emp = $createdEmployees[$apt['employee_idx']];
            $badgeCounter++;
            $badge = sprintf('V-%04d', $badgeCounter);

            Appointment::create([
                'visitor_name' => $apt['visitor_name'],
                'visitor_company' => $apt['visitor_company'],
                'visitor_purpose' => $apt['visitor_purpose'],
                'visitor_phone' => $apt['visitor_phone'],
                'employee_id' => $emp->id,
                'employee_name' => $emp->name,
                'employee_email' => $emp->email,
                'date' => $today,
                'start_time' => now()->setTime($apt['hour'], 0),
                'end_time' => now()->setTime($apt['hour'], 30),
                'status' => $apt['status'],
                'meeting_room' => $rooms[array_rand($rooms)],
                'badge_number' => $badge,
                'created_via' => 'voice_kiosk',
            ]);

            if ($apt['status'] === 'confirmed') {
                Visitor::create([
                    'name' => $apt['visitor_name'],
                    'company' => $apt['visitor_company'],
                    'purpose' => $apt['visitor_purpose'],
                    'phone' => $apt['visitor_phone'],
                    'check_in_time' => now()->setTime($apt['hour'], 0),
                    'host_employee_id' => $emp->id,
                    'status' => 'checked_in',
                    'badge_number' => $badge,
                ]);
            }
        }
    }
}
