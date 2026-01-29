type DateParts = {
  year: number;
  month: number;
  day: number;
};

function getDatePartsForTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  }

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  }

  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second),
  );

  return (asUtc - date.getTime()) / 60000;
}

export function getDateStringInTimeZone(
  date: Date,
  timeZone: string,
): string {
  const parts = getDatePartsForTimeZone(date, timeZone);
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
}

export function getUtcRangeForDate(
  dateString: string,
  timeZone: string,
): { start: Date; end: Date } {
  const [year, month, day] = dateString.split('-').map((v) => Number(v));
  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcMidnight, timeZone);
  const start = new Date(utcMidnight.getTime() - offsetMinutes * 60000);
  const end = new Date(start.getTime() + 24 * 60 * 60000);
  return { start, end };
}

export function getWeekStartDateString(
  dateString: string,
): string {
  const [year, month, day] = dateString.split('-').map((v) => Number(v));
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const weekday = utcDate.getUTCDay();
  const mondayIndex = (weekday + 6) % 7;
  const weekStart = new Date(
    Date.UTC(year, month - 1, day - mondayIndex),
  );
  const parts = {
    year: weekStart.getUTCFullYear(),
    month: weekStart.getUTCMonth() + 1,
    day: weekStart.getUTCDate(),
  };
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${parts.year}-${m}-${d}`;
}
