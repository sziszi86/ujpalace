export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  type: 'tournament' | 'cash-game' | 'special';
  buyIn?: number;
  guarantee?: number;
  stakes?: string;
  description?: string;
}

export function formatDateForCalendar(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseCalendarDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function isToday(date: string): boolean {
  const today = new Date();
  const eventDate = new Date(date);
  return (
    today.getFullYear() === eventDate.getFullYear() &&
    today.getMonth() === eventDate.getMonth() &&
    today.getDate() === eventDate.getDate()
  );
}

export function isUpcoming(date: string): boolean {
  const today = new Date();
  const eventDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getEventsForMonth(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}

export function getWeekdays(): string[] {
  return ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
}

export function getMonthNames(): string[] {
  return [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];
}

export function addTournamentToCalendar(tournament: any) {
  const startDate = new Date(tournament.tournament_date + 'T' + tournament.tournament_time);
  const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // 4 hours later
  
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Palace Poker//Tournament//EN',
    'BEGIN:VEVENT',
    `UID:tournament-${tournament.id}@palace-poker.hu`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${tournament.title}`,
    `DESCRIPTION:Buy-in: ${tournament.buy_in} HUF`,
    'LOCATION:Palace Poker Szombathely',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `tournament-${tournament.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function addCashGameToCalendar(cashGame: any) {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0); // 18:00
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 6, 0); // next day 06:00
  
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Palace Poker//CashGame//EN',
    'BEGIN:VEVENT',
    `UID:cashgame-${cashGame.id}@palace-poker.hu`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${cashGame.name}`,
    `DESCRIPTION:Stakes: ${cashGame.stakes}\\nBuy-in: ${cashGame.min_buy_in}-${cashGame.max_buy_in} HUF`,
    'LOCATION:Palace Poker Szombathely',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `cashgame-${cashGame.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}