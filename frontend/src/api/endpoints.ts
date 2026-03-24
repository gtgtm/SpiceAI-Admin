import client from './client';
import type { Employee, Appointment, Visitor, DashboardStats, PaginatedResponse } from '../types';

// Auth
export const login = (email: string, password: string) =>
  client.post<{ user: any; token: string }>('/login', { email, password });

export const logout = () => client.post('/logout');
export const getMe = () => client.get('/me');

// Dashboard
export const getDashboardStats = () =>
  client.get<DashboardStats>('/dashboard/stats');

// Employees
export const getEmployees = (params?: Record<string, string>) =>
  client.get<Employee[]>('/employees', { params });

export const createEmployee = (data: Partial<Employee>) =>
  client.post<Employee>('/employees', data);

export const updateEmployee = (id: string, data: Partial<Employee>) =>
  client.put<Employee>(`/employees/${id}`, data);

export const deleteEmployee = (id: string) =>
  client.delete(`/employees/${id}`);

export const getDepartments = () =>
  client.get<string[]>('/employees/departments');

// Appointments
export const getAppointments = (params?: Record<string, string>) =>
  client.get<PaginatedResponse<Appointment>>('/appointments', { params });

export const createAppointment = (data: Partial<Appointment>) =>
  client.post<Appointment>('/appointments', data);

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  client.put<Appointment>(`/appointments/${id}`, data);

export const updateAppointmentStatus = (id: string, status: string) =>
  client.patch<Appointment>(`/appointments/${id}/status`, { status });

export const deleteAppointment = (id: string) =>
  client.delete(`/appointments/${id}`);

// Visitors
export const getVisitors = (params?: Record<string, string>) =>
  client.get<PaginatedResponse<Visitor>>('/visitors', { params });

export const updateVisitor = (id: string, data: Partial<Visitor>) =>
  client.put<Visitor>(`/visitors/${id}`, data);

export const checkoutVisitor = (id: string) =>
  client.patch<Visitor>(`/visitors/${id}/checkout`);

export const deleteVisitor = (id: string) =>
  client.delete(`/visitors/${id}`);
