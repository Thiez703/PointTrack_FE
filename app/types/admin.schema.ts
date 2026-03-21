import { z } from "zod";

// --- Module 1: Personnel & User ---
export const CreateEmployeeSchema = z.object({
  fullName: z.string().min(5, "Họ tên phải ít nhất 5 ký tự"),
  phoneNumber: z.string().regex(/^0\d{9}$/, "Số điện thoại VN không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  position: z.string().min(1, "Vui lòng chọn chức vụ"),
  department: z.string().min(1, "Vui lòng chọn phòng ban"),
  salaryLevelId: z.number().min(1, "Vui lòng chọn bậc lương"),
});

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeSchema>;

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  position: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  salaryLevelName: string;
  createdAt: string;
}

// --- Module 2: Customer & Location ---
export const CustomerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10, "Bán kính tối thiểu 10m"),
});

export type CustomerRequest = z.infer<typeof CustomerSchema>;

export interface Customer extends CustomerRequest {
  id: number;
}

// --- Module 3: Shift Template ---
export const ShiftTemplateSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng HH:mm"),
  type: z.enum(["OFFICE", "SHIFT"]),
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
  lateMinutes: z.number().min(0),
  earlyLeaveMinutes: z.number().min(0),
});

export const PenaltyRuleSchema = z.object({
  ruleName: z.string(),
  amount: z.number().min(0),
});

export interface SystemSettings {
  lateMinutes: number;
  earlyLeaveMinutes: number;
  penaltyRules: { ruleName: string; amount: number }[];
}

// --- Module 6: Salary Level ---
export const SalaryLevelSchema = z.object({
  levelName: z.string().min(1, "Tên bậc lương không được để trống"),
  baseSalary: z.number().min(0),
  allowance: z.number().min(0),
});

export type SalaryLevelRequest = z.infer<typeof SalaryLevelSchema>;

export interface SalaryLevel extends SalaryLevelRequest {
  id: number;
}

// Common Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
