export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string | null;
  floor: string | null;
  photo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  visitor_name: string;
  visitor_company: string | null;
  visitor_purpose: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  meeting_room: string | null;
  google_event_id: string | null;
  badge_number: string | null;
  created_via: 'voice_kiosk' | 'manual' | 'walk_in';
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export type AppointmentStatus =
  | 'scheduled' | 'confirmed' | 'in_progress'
  | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';

export interface Visitor {
  id: string;
  name: string;
  company: string | null;
  purpose: string | null;
  phone: string | null;
  email: string | null;
  check_in_time: string;
  check_out_time: string | null;
  host_employee_id: string | null;
  status: VisitorStatus;
  badge_number: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  host_employee?: Employee;
}

export type VisitorStatus =
  | 'checked_in' | 'waiting' | 'in_meeting' | 'checked_out' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface DashboardStats {
  appointments: {
    total: number;
    confirmed: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  visitors: {
    total: number;
    checked_in: number;
    waiting: number;
    in_meeting: number;
    checked_out: number;
  };
  employees: {
    total: number;
    active: number;
  };
  all_time: {
    total_appointments: number;
    total_visitors: number;
  };
  recent_appointments: Appointment[];
  recent_visitors: Visitor[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
