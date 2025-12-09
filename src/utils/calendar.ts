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
  // Handle various date formats
  let dateStr = tournament.tournament_date || tournament.date;
  let timeStr = tournament.tournament_time || tournament.time || '20:00';

  // Extract date part if it contains 'T' (ISO format)
  if (dateStr && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // Ensure time is in HH:MM format
  if (timeStr && !timeStr.includes(':')) {
    timeStr = '20:00';
  }

  // Create start date
  let startDate: Date;
  try {
    startDate = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch {
    console.error('Error parsing tournament date:', dateStr, timeStr);
    alert('Hiba a dátum feldolgozásakor. Kérjük próbáld újra.');
    return;
  }

  const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // 4 hours later

  // Format buy-in
  const buyIn = tournament.buy_in || tournament.buyin_amount || tournament.buyIn || 0;

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Palace Poker//Tournament//EN',
    'BEGIN:VEVENT',
    `UID:tournament-${tournament.id}@palace-poker.hu`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${tournament.title}`,
    `DESCRIPTION:Buy-in: ${buyIn} Ft\\nHelyszín: Palace Poker Szombathely\\nCím: 9700 Szombathely, Semmelweis u. 2.\\nTel: +36 30 971 5832`,
    'LOCATION:Palace Poker Szombathely, Semmelweis u. 2., 9700 Szombathely',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `palace-poker-${tournament.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
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