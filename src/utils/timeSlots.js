const SLOT_MINUTES = 15;
const PREP_BUFFER_MINUTES = 30;

function parseClock(token) {
  const match = String(token || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3].toUpperCase();
  if (hours === 12) hours = 0;
  if (meridiem === 'PM') hours += 12;
  return { hours, minutes };
}

export function parseOpeningHours(openingHours) {
  const match = String(openingHours || '').match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[–\-to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
  if (!match) {
    return { open: { hours: 11, minutes: 0 }, close: { hours: 23, minutes: 0 } };
  }
  return {
    open: parseClock(match[1]) || { hours: 11, minutes: 0 },
    close: parseClock(match[2]) || { hours: 23, minutes: 0 },
  };
}

function atTime(day, clock) {
  const date = new Date(day);
  date.setHours(clock.hours, clock.minutes, 0, 0);
  return date;
}

function roundUpToSlot(date) {
  const next = new Date(date);
  const leftover = next.getMinutes() % SLOT_MINUTES;
  if (leftover !== 0 || next.getSeconds() !== 0 || next.getMilliseconds() !== 0) {
    next.setMinutes(next.getMinutes() + (SLOT_MINUTES - leftover), 0, 0);
  }
  return next;
}

function formatClock(date) {
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function collectDaySlots(day, hours, earliest) {
  const start = atTime(day, hours.open);
  const end = atTime(day, hours.close);
  if (end <= start) end.setDate(end.getDate() + 1);

  const slots = [];
  let cursor = roundUpToSlot(start < earliest ? earliest : start);
  while (cursor < end) {
    slots.push({
      value: `${cursor.toDateString()} ${formatClock(cursor)}`,
      label: formatClock(cursor),
      timestamp: cursor.getTime(),
    });
    cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60 * 1000);
  }
  return slots;
}

export function buildPreferredTimeOptions(openingHours, now = new Date()) {
  const hours = parseOpeningHours(openingHours);
  const earliest = new Date(now.getTime() + PREP_BUFFER_MINUTES * 60 * 1000);
  const today = collectDaySlots(now, hours, earliest);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  tomorrowDate.setHours(0, 0, 0, 0);
  const tomorrow = collectDaySlots(tomorrowDate, hours, earliest);

  return [
    { value: 'ASAP', label: 'ASAP — as soon as possible', group: 'Quick' },
    ...today.map((slot) => ({ ...slot, group: 'Today' })),
    ...tomorrow.map((slot) => ({ ...slot, group: 'Tomorrow' })),
  ];
}
