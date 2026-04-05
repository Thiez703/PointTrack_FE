import { apiJava } from "@/lib/axios";
import {
  ApiResponse,
  Employee,
  PersonnelStats,
  EmployeeSummaryStats,
  CreateEmployeeRequest,
  ShiftTemplate,
  ShiftTemplateRequest,
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
    const response = await apiJava.get("employees", { params });
    return response.data;
  }

  static async getPersonnelStats(): Promise<ApiResponse<PersonnelStats>> {
    const response = await apiJava.get("employees/statistics");
    return response.data;
  }

  static async getPersonnelStatsAlt(): Promise<ApiResponse<EmployeeSummaryStats>> {
    const response = await apiJava.get("employees/stats");
    return response.data;
  }

  static async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    const response = await apiJava.post("employees", data);
    return response.data;
  }

  static async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(`employees/${id}`);
    return response.data;
  }

  static async updateEmployee(id: number, data: Partial<CreateEmployeeRequest>): Promise<ApiResponse<Employee>> {
    const response = await apiJava.put(`employees/${id}`, data);
    return response.data;
  }

  static async updateEmployeeStatus(id: number, status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(`employees/${id}/status`, { status });
    return response.data;
  }

  static async assignSalaryLevel(employeeId: number, salaryLevelId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(`employees/${employeeId}/salary-level`, { salaryLevelId });
    return response.data;
  }

  // --- Shift Template Management ---
  static async createShiftTemplate(data: ShiftTemplateRequest): Promise<ApiResponse<ShiftTemplate>> {
    const response = await apiJava.post("shift-templates", data);
    return response.data;
  }

  static async updateShiftTemplate(id: number, data: ShiftTemplateRequest): Promise<ApiResponse<ShiftTemplate>> {
    const response = await apiJava.put(`shift-templates/${id}`, data);
    return response.data;
  }

  static async deleteShiftTemplate(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(`shift-templates/${id}`);
    return response.data;
  }

  // --- Attendance & Scheduling ---
  static async scheduleWork(data: ScheduleRequest): Promise<ApiResponse<void>> {
    const response = await apiJava.post("attendance/schedule/create", data);
    return response.data;
  }

  static async getAttendanceRecords(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await apiJava.get("attendance/records", { params });
    return response.data;
  }

  static async approveExplanation(explanationId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.put(`attendance/explanations/${explanationId}/approve`);
    return response.data;
  }

  // --- System Configuration ---
  static async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await apiJava.get("scheduling/settings");
    return response.data;
  }

  static async updateGracePeriod(data: { gracePeriodMinutes: number }): Promise<ApiResponse<void>> {
    const response = await apiJava.put("scheduling/settings/grace-period", data);
    return response.data;
  }

  // --- Salary Level Management ---
  static async getSalaryLevels(): Promise<ApiResponse<SalaryLevel[]>> {
    const response = await apiJava.get("salary-levels");
    return response.data;
  }

  static async createSalaryLevel(data: SalaryLevelRequest): Promise<ApiResponse<SalaryLevel>> {
    const response = await apiJava.post("salary-levels", data);
    return response.data;
  }
}
