import { format, isToday, isYesterday, isThisWeek, differenceInCalendarWeeks, parse, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'

export function formatMessageTimestamp(timestamp: string | number | Date): string {
  const messageDate = new Date(timestamp)
  const now = new Date()

  if (isToday(messageDate)) {
    return `Hôm nay, ${format(messageDate, 'p', { locale: vi })}`
  }

  if (isYesterday(messageDate)) {
    return `Hôm qua, ${format(messageDate, 'p', { locale: vi })}`
  }

  if (isThisWeek(messageDate, { weekStartsOn: 1 })) {
    return format(messageDate, 'eeee, p', { locale: vi })
  }

  if (differenceInCalendarWeeks(now, messageDate, { weekStartsOn: 1 }) === 1) {
    return `Tuần trước, ${format(messageDate, 'eeee, p', { locale: vi })}`
  }

  return format(messageDate, 'P p', { locale: vi })
}

/**
 * Định dạng ngày sang YYYY-MM-DD
 */
export const formatToISODate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Định dạng hiển thị ngày tiếng Việt (VD: Thứ Hai (16/03))
 */
export const formatVietnameseDay = (date: Date) => {
  return format(date, 'EEEE (dd/MM)', { locale: vi })
}

/**
 * Lấy danh sách các ngày trong một tuần từ một ngày bất kỳ
 */
export const getDaysInWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/**
 * Format dải ngày trong tuần (VD: 16/03 – 22/03/2026)
 */
export const formatWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return `${format(start, 'dd/MM')} – ${format(end, 'dd/MM/yyyy')}`
}

/**
 * Tính thời lượng ca làm việc (phút)
 * Hỗ trợ ca qua đêm nếu là OT_EMERGENCY hoặc endMin < startMin
 */
export const calculateShiftDuration = (
  startTime: string,
  endTime: string,
  shiftType?: string
) => {
  if (!startTime || !endTime) return 0

  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  
  const startTotal = sh * 60 + sm
  let endTotal = eh * 60 + em

  if (endTotal < startTotal) {
    // Giả định là ca qua đêm
    endTotal += 24 * 60
  }

  return endTotal - startTotal
}

/**
 * Lấy số tuần trong năm (ISO) dạng YYYY-Www
 */
export const getWeekYearString = (date: Date) => {
  return format(date, "yyyy-'W'II", { locale: vi })
}

