import { z } from "zod";

// --- Module 1: Personnel & User ---
export const CreateEmployeeSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải từ 2-100 ký tự").max(100, "Họ tên tối đa 100 ký tự"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"),
  email: z.string().email("Email không hợp lệ"),
  salaryLevelId: z.number().optional(),
  hiredDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const d = new Date(date);
    return d <= new Date();
  }, "Ngày vào làm không được là ngày trong tương lai"),
  area: z.string().max(100, "Khu vực tối đa 100 ký tự").optional(),
  skills: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
});

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeSchema>;

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  phone: string;
  email: string | null;
  position: string;
  department: string;
  avatarUrl: string | null;
  area: string | null;
  skills: string[];
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  role: "USER" | "ADMIN";
  isFirstLogin: boolean;
  hiredDate: string | null;
  salaryLevelId: number | null;
  salaryLevelName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newEmployeesThisMonth: number;
  totalTrend: string;
  activeRate: string;
}

// --- Module 3: Shift Template ---
export const ShiftTemplateSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống"),
  defaultStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Định dạng HH:mm:ss"),
  defaultEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Định dạng HH:mm:ss"),
  shiftType: z.enum(["NORMAL", "HOLIDAY", "OT_EMERGENCY"]),
});

export type ShiftTemplateRequest = z.infer<typeof ShiftTemplateSchema>;

export interface ShiftTemplate extends ShiftTemplateRequest {
  id: number;
}

// --- Module 4: Attendance & Scheduling ---
export const ScheduleSchema = z.object({
  employeeId: z.number(),
  customerId: z.number(),
  shiftTemplateId: z.number(),
  workDate: z.string(), // ISO Date
});

export type ScheduleRequest = z.infer<typeof ScheduleSchema>;

export interface AttendanceRecord {
  id: number;
  employeeName: string;
  customerName: string;
  shiftName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "EARLY_LEAVE";
}

// --- Module 5: System Settings ---
export const GracePeriodSchema = z.object({
  gracePeriodMinutes: z.number().min(0),
});

export const PenaltyRuleSchema = z.object({
  rules: z.array(z.object({
    minLateMinutes: z.number().min(0),
    deductionPercent: z.number().min(0).max(100),
  })),
});

export interface SystemSettings {
  gracePeriodMinutes: number;
  penaltyRules: { minLateMinutes: number, deductionPercent: number }[];
}

// --- Module 6: Salary Level ---
export const SalaryLevelSchema = z.object({
  name: z.string().min(1, "Tên bậc lương không được để trống"),
  baseSalary: z.number().min(0),
});

export type SalaryLevelRequest = z.infer<typeof SalaryLevelSchema>;

export interface SalaryLevel {
  id: number;
  name: string;
  baseSalary: number;
}

// Common Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
