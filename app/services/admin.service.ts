import { apiJava } from "@/lib/axios";
import {
  ApiResponse,
  Employee,
  CreateEmployeeRequest,
  Customer,
  CustomerRequest,
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
    const response = await apiJava.get("/v1/personnel", { params });
    return response.data;
  }

  static async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    const response = await apiJava.post("/v1/personnel", data);
    return response.data;
  }

  static async updateEmployee(id: number, data: Partial<CreateEmployeeRequest>): Promise<ApiResponse<Employee>> {
    const response = await apiJava.put(`/v1/personnel/${id}`, data);
    return response.data;
  }

  static async updateEmployeeStatus(id: number, status: "ACTIVE" | "INACTIVE"): Promise<ApiResponse<void>> {
    const response = await apiJava.patch(`/v1/personnel/${id}/status`, { status });
    return response.data;
  }

  static async assignSalaryLevel(employeeId: number, salaryLevelId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.post(`/v1/personnel/${employeeId}/salary-level`, { salaryLevelId });
    return response.data;
  }

  // --- Customer & Location Management ---
  static async getCustomers(params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<{ content: Customer[]; totalPages: number }>> {
    const response = await apiJava.get("/v1/customers", { params });
    return response.data;
  }

  static async createCustomer(data: CustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiJava.post("/v1/customers", data);
    return response.data;
  }

  static async updateCustomer(id: number, data: CustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiJava.put(`/v1/customers/${id}`, data);
    return response.data;
  }

  static async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    const response = await apiJava.delete(`/v1/customers/${id}`);
    return response.data;
  }

  // --- Shift Template Management ---
  static async getShiftTemplates(): Promise<ApiResponse<ShiftTemplate[]>> {
    const response = await apiJava.get("/v1/shift-templates");
    return response.data;
  }

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
    const response = await apiJava.post("/v1/attendance/schedule", data);
    return response.data;
  }

  static async getAttendanceRecords(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await apiJava.get("/v1/attendance/records", { params });
    return response.data;
  }

  static async approveExplanation(explanationId: number): Promise<ApiResponse<void>> {
    const response = await apiJava.post("/v1/attendance/approve", { explanationId });
    return response.data;
  }

  // --- System Configuration ---
  static async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await apiJava.get("/v1/settings");
    return response.data;
  }

  static async updateGracePeriod(data: { lateMinutes: number; earlyLeaveMinutes: number }): Promise<ApiResponse<void>> {
    const response = await apiJava.put("/v1/settings/grace-period", data);
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
