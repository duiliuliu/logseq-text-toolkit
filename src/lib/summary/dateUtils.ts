/**
 * Summary 日期工具
 *
 * 统一使用本地时间计算日期边界，避免 toISOString() 在 UTC+ 时区把日期减一天。
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isValidDate(date: Date | null | undefined): date is Date {
  return !!date && !Number.isNaN(date.getTime());
}

/** 解析 YYYY-MM-DD 为本地日期，避免 new Date('YYYY-MM-DD') 的 UTC 偏移。 */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(date);
}

/** 输出本地 YYYY-MM-DD。 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export interface ISOWeekInfo {
  year: number;
  week: number;
  start: Date;
}

/**
 * ISO-8601 周信息：周一为一周开始，包含周四的那一周为第 1 周。
 * 使用 UTC 中间值计算，避免 DST 造成 6.96/7.04 天误差。
 */
export function getISOWeekInfo(date: Date): ISOWeekInfo {
  const local = startOfDay(date);
  const utc = Date.UTC(local.getFullYear(), local.getMonth(), local.getDate());
  const dayNumber = (new Date(utc).getUTCDay() + 6) % 7; // Monday = 0
  const thursday = utc + (3 - dayNumber) * DAY_MS;
  const isoYear = new Date(thursday).getUTCFullYear();

  const jan4 = Date.UTC(isoYear, 0, 4);
  const jan4Day = (new Date(jan4).getUTCDay() + 6) % 7;
  const firstMonday = jan4 - jan4Day * DAY_MS;
  const monday = thursday - 3 * DAY_MS;
  const week = Math.round((monday - firstMonday) / (7 * DAY_MS)) + 1;

  const mondayDate = new Date(monday);
  const start = new Date(
    mondayDate.getUTCFullYear(),
    mondayDate.getUTCMonth(),
    mondayDate.getUTCDate()
  );

  return { year: isoYear, week, start };
}

/** 根据 ISO 周年 + 周数取得周一（本地 00:00）。 */
export function getISOWeekStart(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const firstMonday = addDays(jan4, -jan4Day);
  return startOfDay(addDays(firstMonday, (Math.max(1, week) - 1) * 7));
}

/** 生成按本地日期分组的周范围（周一到周日）。 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const { start } = getISOWeekInfo(date);
  return {
    start: startOfDay(start),
    end: endOfDay(addDays(start, 6)),
  };
}

/**
 * 自定义范围标准化：自动补全缺失的一端，并校验 start <= end。
 * 时间边界统一为当天 00:00 / 23:59:59.999。
 */
export function normalizeCustomRange(
  customStart?: Date,
  customEnd?: Date,
  fallback: Date = new Date()
): { start: Date; end: Date } {
  if (customStart && !isValidDate(customStart)) {
    throw new Error('INVALID_START_DATE');
  }
  if (customEnd && !isValidDate(customEnd)) {
    throw new Error('INVALID_END_DATE');
  }

  const startDate = customStart ? startOfDay(customStart) : (customEnd ? startOfDay(customEnd) : startOfDay(fallback));
  const endDate = customEnd ? endOfDay(customEnd) : endOfDay(startDate);

  if (startDate.getTime() > endDate.getTime()) {
    throw new Error('INVALID_DATE_RANGE');
  }

  return { start: startDate, end: endDate };
}
