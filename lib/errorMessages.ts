export const ERROR_MESSAGES: Record<string, string> = {
  // Customer
  CUSTOMER_NOT_FOUND: 'Không tìm thấy khách hàng',
  CUSTOMER_INACTIVE: 'Khách hàng đã bị vô hiệu hóa',
  CUSTOMER_SUSPENDED: 'Khách hàng đang tạm dừng dịch vụ',
  CUSTOMER_NO_GPS: 'Khách hàng chưa có tọa độ GPS',
  GPS_COORDINATES_INVALID: 'Tọa độ GPS không hợp lệ',
  IMPORT_FILE_INVALID: 'File không đúng định dạng',
  
  // Employee
  PHONE_ALREADY_EXISTS: 'Số điện thoại đã tồn tại',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  EMPLOYEE_NOT_FOUND: 'Không tìm thấy nhân viên',
  EMPLOYEE_INACTIVE: 'Nhân viên đã bị vô hiệu hóa',
  EMPLOYEE_ON_LEAVE: 'Nhân viên đang nghỉ phép, không thể gán ca',
  SALARY_LEVEL_NOT_FOUND: 'Không tìm thấy cấp bậc lương',
  SALARY_LEVEL_IN_USE: 'Cấp bậc đang được sử dụng, không thể xóa',
  
  // Auth
  OTP_INVALID: 'OTP không đúng',
  OTP_EXPIRED: 'OTP đã hết hạn, vui lòng yêu cầu lại',
  RESET_TOKEN_INVALID: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
  PASSWORD_POLICY_VIOLATED: 'Mật khẩu không đủ điều kiện (≥8 ký tự, có hoa, có số)',
  
  // Shift
  SHIFT_CONFLICT: 'Ca bị trùng giờ với ca đã có',
  SHIFT_BUFFER_VIOLATION: 'Không đủ thời gian buffer 15 phút giữa hai ca',
  SHIFT_OVERNIGHT_INVALID: 'Ca thường không được phép qua đêm',
  
  // Common
  UNKNOWN_ERROR: 'Có lỗi xảy ra, vui lòng thử lại sau',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  UNAUTHORIZED: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
}

/**
 * Maps error codes or full error objects to localized Vietnamese messages.
 * Compatible with both string codes and Axios error objects.
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR

  // Case 1: error is a string (errorCode)
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES.UNKNOWN_ERROR
  }

  // Case 2: error is an Axios-like object with response structure
  const errorCode = error.response?.data?.errorCode || error.errorCode
  const message = error.response?.data?.message || error.message

  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode]
  }

  return message || ERROR_MESSAGES.UNKNOWN_ERROR
}

