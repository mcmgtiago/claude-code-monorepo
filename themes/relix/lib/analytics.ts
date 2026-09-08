export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function shiftMonth(date: Date, diff: number) {
  return new Date(date.getFullYear(), date.getMonth() + diff, 1);
}

export function countByMonth(dates: Date[], target: Date) {
  const targetKey = getMonthKey(target);
  return dates.filter((date) => getMonthKey(date) === targetKey).length;
}

export function sumByMonth(values: Array<{ date: Date; value: number }>, target: Date) {
  const targetKey = getMonthKey(target);
  return values.filter((item) => getMonthKey(item.date) === targetKey).reduce((sum, item) => sum + item.value, 0);
}

export function formatDelta(current: number, previous: number) {
  if (current === 0 && previous === 0) {
    return { label: "No change", tone: "neutral" as const };
  }

  if (previous === 0) {
    return { label: "New", tone: "positive" as const };
  }

  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(delta) * 10) / 10;

  if (rounded === 0) {
    return { label: "No change", tone: "neutral" as const };
  }

  return {
    label: `${rounded}%`,
    tone: delta >= 0 ? ("positive" as const) : ("negative" as const)
  };
}
