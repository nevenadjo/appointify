export type Hours = { dayOfWeek: number; isOpen: boolean; startTime: string | null; endTime: string | null; breakStart: string | null; breakEnd: string | null };
export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export function hoursText(hour?: Hours) {
  if (!hour) return "Not specified";
  if (!hour.isOpen) return "Closed";
  if (!hour.startTime || !hour.endTime) return "Hours not specified";
  return `${hour.startTime} – ${hour.endTime}`;
}

export function groupedHours(hours: Hours[]) {
  const groups: { first: number; last: number; text: string }[] = [];
  for (const day of dayOrder) {
    const text = hoursText(hours.find((hour) => hour.dayOfWeek === day));
    const previous = groups[groups.length - 1];
    if (previous && previous.text === text) previous.last = day;
    else groups.push({ first: day, last: day, text });
  }
  return groups.map((group) => ({ ...group, label: group.first === group.last ? days[group.first] : `${days[group.first]} – ${days[group.last]}` }));
}

export default function BusinessHours({ hours }: { hours: Hours[] }) {
  return <div className="min-w-0">
    <h2 className="text-sm font-semibold">Working hours</h2>
    {hours.length ? <dl className="mt-3 space-y-3 text-sm">
      {groupedHours(hours).map((group) => <div key={group.first}><dt>{group.label}</dt><dd className="mt-1 text-gray-600">{group.text}</dd></div>)}
    </dl> : <p className="mt-2 text-sm text-gray-500">Working hours not specified.</p>}
  </div>;
}
