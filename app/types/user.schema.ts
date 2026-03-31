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
  };
  history: Array<{
    month: string; // Định dạng "T1", "T2", ...
    days: number;
  }>;
}
