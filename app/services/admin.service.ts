import { apiJava } from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  ApiResponse,
  Employee,
  PersonnelStats,
  EmployeeSummaryStats,
  CreateEmployeeRequest,
  AttendanceRecord,
  ScheduleRequest,
  SystemSettings,
  SalaryLevel,
  SalaryLevelRequest,
} from "@/app/types/admin.schema";

export class AdminService {
  // --- Personnel & User Management ---
  static async getPersonnel(params?: {
    page?: number;
    size?: number;
    search?: string;
    department?: string;
  }): Promise<ApiResponse<{ content: Employee[]; totalPages: number }>> {
    const response = await apiJava.get(API_ENDPOINTS.EMPLOYEES.LIST, { params });
    return response.data;
  }

  static async getPersonnelStats(): Promise<ApiResponse<PersonnelStats>> {
    const response = await apiJava.get(API_ENDPOINTS.EMPLOYEES.STATISTICS);
    return response.data;
  }

  static async getPersonnelStatsAlt(): Promise<ApiResponse<EmployeeSummaryStats>> {
    const response = await apiJava.get(API_ENDPOINTS.EMPLOYEES.STATS);
    return response.data;
  }

  static async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    const response = await apiJava.post(API_ENDPOINTS.EMPLOYEES.CREATE, data);
    return response.data;
  }

  static async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(API_ENDPOINTS.EMPLOYEES.DELETE(id));
    return response.data;
  }

  static async updateEmployee(id: number, data: Partial<CreateEmployeeRequest>): Promise<ApiResponse<Employee>> {
    const response = await apiJava.put(API_ENDPOINTS.EMPLOYEES.UPDATE(id), data);
    return response.data;
  }

  static async updateEmployeeStatus(id: number, status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(API_ENDPOINTS.EMPLOYEES.UPDATE_STATUS(id), { status });
    return response.data;
  }

  static async assignSalaryLevel(employeeId: number, salaryLevelId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(API_ENDPOINTS.EMPLOYEES.UPDATE_SALARY_LEVEL(employeeId), { salaryLevelId });
    return response.data;
  }

  // --- Attendance & Scheduling ---
  static async scheduleWork(data: ScheduleRequest): Promise<ApiResponse<void>> {
    const response = await apiJava.post(API_ENDPOINTS.ATTENDANCE.SCHEDULE_CREATE, data);
    return response.data;
  }

  static async getAttendanceRecords(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await apiJava.get(API_ENDPOINTS.ATTENDANCE.RECORDS, { params });
    return response.data;
  }

  static async approveExplanation(explanationId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.put(API_ENDPOINTS.ATTENDANCE.APPROVE_EXPLANATION(explanationId));
    return response.data;
  }

  // --- System Configuration ---
  static async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await apiJava.get(API_ENDPOINTS.SCHEDULING_SETTINGS.GET);
    return response.data;
  }

  static async updateGracePeriod(data: { gracePeriodMinutes: number }): Promise<ApiResponse<void>> {
    const response = await apiJava.put(API_ENDPOINTS.SCHEDULING_SETTINGS.UPDATE_GRACE_PERIOD, data);
    return response.data;
  }

  // --- Salary Level Management ---
  static async getSalaryLevels(): Promise<ApiResponse<SalaryLevel[]>> {
    const response = await apiJava.get(API_ENDPOINTS.SALARY_LEVELS.LIST);
    return response.data;
  }

  static async createSalaryLevel(data: SalaryLevelRequest): Promise<ApiResponse<SalaryLevel>> {
    const response = await apiJava.post(API_ENDPOINTS.SALARY_LEVELS.CREATE, data);
    return response.data;
  }
}
