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

const TIME_FIELD_LABELS: Record<string, string> = {
  startTime: 'Giờ bắt đầu',
  endTime: 'Giờ kết thúc',
  checkInTime: 'Giờ check-in',
  checkOutTime: 'Giờ check-out',
}

const isSystemError = (status?: number): boolean => {
  if (!status) return true
  return status >= 500
}

const parseSpringTypeConversionError = (raw: string): string | null => {
  const paramMatch = raw.match(/Method parameter '([^']+)'/i)
  const valueMatch = raw.match(/value \[([^\]]*)\]/i)

  const param = paramMatch?.[1]
  const value = valueMatch?.[1]

  if (!param) return null

  if (raw.includes('LocalTime')) {
    const label = TIME_FIELD_LABELS[param] || param
    const shownValue = typeof value === 'string' && value.length > 0 ? value : '(rỗng)'
    return `${label} không hợp lệ: "${shownValue}". Vui lòng nhập đúng định dạng HH:mm (ví dụ 08:30).`
  }

  return null
}

const parseSpringValidationError = (raw: string): string | null => {
  // Example: Field error in object 'loginRequest' on field 'password' ...
  const fieldMatch = raw.match(/on field '([^']+)'/i)
  const defaultMessageMatch = raw.match(/default message \[([^\]]+)\]/i)

  if (!fieldMatch && !defaultMessageMatch) return null

  const field = fieldMatch?.[1]
  const defaultMessage = defaultMessageMatch?.[1]

  if (defaultMessage) {
    return `Dữ liệu không hợp lệ${field ? ` ở trường "${field}"` : ''}: ${defaultMessage}.`
  }

  if (field) {
    return `Dữ liệu không hợp lệ ở trường "${field}".`
  }

  return null
}

export const normalizeApiError = (error: any): { message: string; errorCode: string; response?: any } => {
  const response = error?.response
  const status: number | undefined = response?.status
  const errorsArray = Array.isArray(response?.data?.errors) ? response.data.errors : []
  const firstErrorDetail =
    errorsArray.length > 0 && typeof errorsArray[0] === 'string'
      ? errorsArray[0]
      : null

  const errorCode =
    response?.data?.errorCode ||
    error?.errorCode ||
    'UNKNOWN_ERROR'

  const detail = response?.data?.detail
  const backendMessage = response?.data?.message
  const rawMessage =
    firstErrorDetail ||
    (typeof detail === 'string' && detail) ||
    (typeof backendMessage === 'string' && backendMessage) ||
    (typeof error?.message === 'string' ? error.message : '')

  // 1) Ưu tiên map theo errorCode nếu có
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return { message: ERROR_MESSAGES[errorCode], errorCode, response }
  }

  // 2) Nếu là lỗi hệ thống (5xx / network), dùng thông điệp chung
  if (isSystemError(status)) {
    return {
      message: 'Lỗi hệ thống, vui lòng thử lại sau hoặc liên hệ kỹ thuật.',
      errorCode,
      response,
    }
  }

  // 3) Parse các lỗi kỹ thuật của Spring thành thông điệp dễ hiểu cho admin
  if (rawMessage) {
    const convertedTimeMessage = parseSpringTypeConversionError(rawMessage)
    if (convertedTimeMessage) {
      return { message: convertedTimeMessage, errorCode, response }
    }

    const validationMessage = parseSpringValidationError(rawMessage)
    if (validationMessage) {
      return { message: validationMessage, errorCode, response }
    }

    // 4) Lỗi nghiệp vụ không phải system: giữ message backend (thường đã có nghĩa)
    return { message: rawMessage, errorCode, response }
  }

  return { message: ERROR_MESSAGES.UNKNOWN_ERROR, errorCode, response }
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
  return normalizeApiError(error).message
}

