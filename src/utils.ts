export function timeAgo(dateInput?: string | Date): string {
  if (dateInput === null || dateInput === undefined) {
    return '';
  }
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];

  let counter = seconds;
  for (let i = 0; i < intervals.length; i++) {
    if (counter < intervals[i][0]) {
      const rounded = Math.floor(counter);

      if (i == 0 && rounded <= 0) return 'just now';

      const label = intervals[i][1];
      return `${rounded} ${label}${rounded === 1 ? '' : 's'} ago`;
    }
    counter /= intervals[i][0];
  }

  return 'a long time ago';
}