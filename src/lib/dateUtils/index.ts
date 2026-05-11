/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Dayjs 日期格式化工具库
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import { logger } from '../../logseq/logger';

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export const LOGSEQ_DATE_FORMAT_MAP: Record<string, string> = {
  'E, MM/dd/yyyy': 'd, MM/DD/YYYY',
  'E, dd-MM-yyyy': 'd, DD-MM-YYYY',
  'E, dd.MM.yyyy': 'd, DD.MM.YYYY',
  'E, yyyy/MM/dd': 'd, YYYY/MM/DD',

  'EEE, MM/dd/yyyy': 'ddd, MM/DD/YYYY',
  'EEE, dd-MM-yyyy': 'ddd, DD-MM-YYYY',
  'EEE, dd.MM.yyyy': 'ddd, DD.MM.YYYY',
  'EEE, yyyy/MM/dd': 'ddd, YYYY/MM/DD',

  'EEEE, MM/dd/yyyy': 'dddd, MM/DD/YYYY',
  'EEEE, dd-MM-yyyy': 'dddd, DD-MM-YYYY',
  'EEEE, dd.MM.yyyy': 'dddd, DD.MM.YYYY',
  'EEEE, yyyy/MM/dd': 'dddd, YYYY/MM/DD',

  'MM-dd-yyyy': 'MM-DD-YYYY',
  'MM/dd/yyyy': 'MM/DD/YYYY',
  'MMM do, yyyy': 'MMM Do, YYYY',
  'MMMM do, yyyy': 'MMMM Do, YYYY',
  'MM_dd_yyyy': 'MM_DD_YYYY',
  'dd-MM-yyyy': 'DD-MM-YYYY',
  'do MMM yyyy': 'Do MMM YYYY',
  'do MMMM yyyy': 'Do MMMM YYYY',
  'yyyy-MM-dd': 'YYYY-MM-DD',
  'yyyy-MM-dd EEE': 'YYYY-MM-DD ddd',
  'yyyy-MM-dd EEEE': 'YYYY-MM-DD dddd',
  'yyyy/MM/dd': 'YYYY/MM/DD',
  'yyyyMMdd': 'YYYYMMDD',
  'yyyy_MM_dd': 'YYYY_MM_DD',
  'yyyy年MM月dd日': 'YYYY年MM月DD日',
};

export const SUPPORTED_LOGSEQ_FORMATS = Object.keys(LOGSEQ_DATE_FORMAT_MAP);

export function logseqFormatToDayjsFormat(logseqFormat: string): string {
  return LOGSEQ_DATE_FORMAT_MAP[logseqFormat] || 'YYYY-MM-DD';
}

export function formatDate(
  date: Date | string | number,
  logseqFormat?: string
): string {
  const d = dayjs(date);
  if (!d.isValid()) {
    return '';
  }

  if (logseqFormat) {
    const dayjsFormat = logseqFormatToDayjsFormat(logseqFormat);
    logger.debug('📅 DateUtils: Formatting date with logseq format', { date, logseqFormat, dayjsFormat });
    return d.format(dayjsFormat);
  }

  return d.format('YYYY-MM-DD ddd');
}

export function formatDateForPage(
  date: Date | string | number,
  logseqFormat?: string
): string {
  return formatDate(date, logseqFormat);
}

export function formatDateTime(
  date: Date | string | number,
  includeSeconds: boolean = false
): string {
  const d = dayjs(date);
  if (!d.isValid()) {
    return '';
  }
  return includeSeconds
    ? d.format('YYYY-MM-DD HH:mm:ss')
    : d.format('YYYY-MM-DD HH:mm');
}

export function formatLocalDateTimeNoTZ(d: Date): string {
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function formatISODate(date: Date | string | number): string {
  const d = dayjs(date);
  if (!d.isValid()) {
    return '';
  }
  return d.format('YYYY-MM-DD');
}

export function formatISODateTime(date: Date | string | number): string {
  const d = dayjs(date);
  if (!d.isValid()) {
    return '';
  }
  return d.format('YYYY-MM-DDTHH:mm:ss');
}

export function parseDate(
  dateStr: string,
  logseqFormat?: string
): Date | null {
  if (logseqFormat) {
    const format = logseqFormatToDayjsFormat(logseqFormat);
    const d = dayjs(dateStr, format, true);
    if (d.isValid()) {
      return d.toDate();
    }
  }

  const d = dayjs(dateStr);
  if (d.isValid()) {
    return d.toDate();
  }

  return null;
}

export function toUTC(date: Date | string | number): string {
  return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function utcToLocal(
  utcStr: string,
  logseqFormat?: string
): string {
  const format = logseqFormat
    ? logseqFormatToDayjsFormat(logseqFormat)
    : 'YYYY-MM-DD';

  return dayjs.utc(utcStr).local().format(format);
}

export function getCurrentDateStr(logseqFormat?: string): string {
  return formatDate(new Date(), logseqFormat);
}

export function getWeekNumber(date: Date | string | number): number {
  return dayjs(date).week();
}

export function getISOWeekNumber(date: Date | string | number): number {
  return dayjs(date).isoWeek();
}

export function getDayOfWeek(date: Date | string | number): number {
  return dayjs(date).day();
}

export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`).daysInMonth();
}

export function addDays(date: Date | string | number, days: number): Date {
  return dayjs(date).add(days, 'day').toDate();
}

export function addMonths(date: Date | string | number, months: number): Date {
  return dayjs(date).add(months, 'month').toDate();
}

export function addYears(date: Date | string | number, years: number): Date {
  return dayjs(date).add(years, 'year').toDate();
}

export function startOfMonth(date: Date | string | number): Date {
  return dayjs(date).startOf('month').toDate();
}

export function endOfMonth(date: Date | string | number): Date {
  return dayjs(date).endOf('month').toDate();
}

export function startOfYear(date: Date | string | number): Date {
  return dayjs(date).startOf('year').toDate();
}

export function endOfYear(date: Date | string | number): Date {
  return dayjs(date).endOf('year').toDate();
}

export function isSameDay(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day');
}

export function isToday(date: Date | string | number): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function fromNow(date: Date | string | number): string {
  return dayjs(date).fromNow();
}

export function toNow(date: Date | string | number): string {
  return dayjs(date).toNow();
}

export { dayjs };
