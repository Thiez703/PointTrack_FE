import { apiJava } from "@/lib/axios";
import {
  ApiResponse,
  Employee,
  PersonnelStats,
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
    const response = await apiJava.get("/v1/employees", { params });
    return response.data;
  }

  static async getPersonnelStats(): Promise<ApiResponse<PersonnelStats>> {
    const response = await apiJava.get("/v1/employees/statistics");
    return response.data;
  }

  static async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    const response = await apiJava.post("/v1/employees", data);
    return response.data;
  }

  static async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(`/v1/employees/${id}`);
    return response.data;
  }

  static async updateEmployee(id: number, data: Partial<CreateEmployeeRequest>): Promise<ApiResponse<Employee>> {
    const response = await apiJava.put(`/v1/employees/${id}`, data);
    return response.data;
  }

  static async updateEmployeeStatus(id: number, status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(`/v1/employees/${id}/status`, { status });
    return response.data;
  }

  static async assignSalaryLevel(employeeId: number, salaryLevelId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(`/v1/employees/${employeeId}/salary-level`, { salaryLevelId });
    return response.data;
  }

  // --- Shift Template Management ---
  static async createShiftTemplate(data: ShiftTemplateRequest): Promise<ApiResponse<ShiftTemplate>> {
    const response = await apiJava.post("/v1/shift-templates", data);
    return response.data;
  }

  static async updateShiftTemplate(id: number, data: ShiftTemplateRequest): Promise<ApiResponse<ShiftTemplate>> {
    const response = await apiJava.put(`/v1/shift-templates/${id}`, data);
    return response.data;
  }

  static async deleteShiftTemplate(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(`/v1/shift-templates/${id}`);
    return response.data;
  }

  // --- Attendance & Scheduling ---
  static async scheduleWork(data: ScheduleRequest): Promise<ApiResponse<void>> {
    const response = await apiJava.post("/v1/attendance/schedule/create", data);
    return response.data;
  }

  static async getAttendanceRecords(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await apiJava.get("/v1/attendance/records", { params });
    return response.data;
  }

  static async approveExplanation(explanationId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.put(`/v1/attendance/explanations/${explanationId}/approve`);
    return response.data;
  }

  // --- System Configuration ---
  static async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await apiJava.get("/v1/scheduling/settings");
    return response.data;
  }

  static async updateGracePeriod(data: { gracePeriodMinutes: number }): Promise<ApiResponse<void>> {
    const response = await apiJava.put("/v1/scheduling/settings/grace-period", data);
    return response.data;
  }

  // --- Salary Level Management ---
  static async getSalaryLevels(): Promise<ApiResponse<SalaryLevel[]>> {
    const response = await apiJava.get("/v1/salary-levels");
    return response.data;
  }

  static async createSalaryLevel(data: SalaryLevelRequest): Promise<ApiResponse<SalaryLevel>> {
    const response = await apiJava.post("/v1/salary-levels", data);
    return response.data;
  }
}
