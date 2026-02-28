import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  differenceInDays,
  parseISO,
} from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString)

  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru })
  }

  if (isYesterday(date)) {
    return `вчера, ${format(date, 'HH:mm')}`
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE, HH:mm', { locale: ru })
  }

  const daysAgo = differenceInDays(new Date(), date)
  if (daysAgo < 365) {
    return format(date, 'd MMM', { locale: ru })
  }

  return format(date, 'd MMM yyyy', { locale: ru })
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'dd.MM.yyyy HH:mm')
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru })
}

export function formatShortDate(dateString: string): string {
  return format(parseISO(dateString), 'd MMM', { locale: ru })
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm')
}
