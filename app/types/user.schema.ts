export interface UserType {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  role: 'USER' | 'ADMIN'
  avatarUrl?: string | null
}

export interface SignupFormValues {
  fullName: string
  email?: string
  phoneNumber: string
  password: string
}

export interface ProfileFormValues {
  fullName?: string
  email?: string
  phoneNumber?: string
  avatarUrl?: string | null
}

export interface AvatarImage {
  imageUrl: string
}

export interface ChangePasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AddressFormValues {
  id?: number
  label?: string
  addressLine: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}

export interface EmployeeProfileResponse {
  success: boolean;
  message: string;
  data: EmployeeProfile;
}

export interface EmployeeProfile {
  id: number;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  position: string;     // Tương ứng với SalaryLevel name
  department: string;   // Tương ứng với Area
  hiredDate: string;    // Định dạng "YYYY-MM-DD"
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  workStatistics: WorkStatistics;
}

export interface WorkStatistics {
  summary: {
    totalWorkDaysThisMonth: number;
    otHoursThisMonth: number;
    lateDaysThisMonth: number;
    estimatedSalary: number;    // Lương dự tính (BE xử lý)
    totalWorkHours: number;      // Tổng giờ công (BE xử lý)
    totalHoursThisMonth: number;
    estimatedSalaryThisMonth: number;
  };
  history: Array<{
    month: string; // Định dạng "T1", "T2", ...
    days: number;
  }>;
}

