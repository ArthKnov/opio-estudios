import { scheduleConfig, scheduleEndpoint } from '@/constants/schedule';

export type BookingPayload = {
  name: string;
  email: string;
  phone: string;
  interest: string[];
  message: string;
  /** YYYY-MM-DD (data local de Sao Paulo). */
  date: string;
  /** HH:mm (horario de Sao Paulo). */
  time: string;
  /** Honeypot anti-spam: precisa ir vazio. */
  website: string;
};

export type BookingResult = { ok: true; meetLink?: string } | { ok: false; code: 'not-configured' | 'taken' | 'invalid' | 'network' | 'server'; message: string };

const isMock = scheduleEndpoint === 'mock';

export const isScheduleConfigured = scheduleEndpoint.length > 0;

/** Horarios ja ocupados (HH:mm) em uma data. Em caso de erro, devolve lista vazia (o servidor revalida). */
export async function fetchBusySlots(date: string): Promise<string[]> {
  if (!isScheduleConfigured) return [];
  if (isMock) {
    await wait(350);
    const day = Number(date.slice(-2));
    return scheduleConfig.slots.filter((_, i) => (day + i) % 4 === 0);
  }
  try {
    const url = `${scheduleEndpoint}${scheduleEndpoint.includes('?') ? '&' : '?'}action=busy&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    const data = (await res.json()) as { ok: boolean; busy?: string[] };
    return data.ok && Array.isArray(data.busy) ? data.busy : [];
  } catch {
    return [];
  }
}

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  if (!isScheduleConfigured) {
    return { ok: false, code: 'not-configured', message: 'O agendamento online ainda não foi configurado.' };
  }
  if (isMock) {
    await wait(1400);
    return { ok: true, meetLink: 'https://meet.google.com/' };
  }
  try {
    const res = await fetch(scheduleEndpoint, {
      method: 'POST',
      // text/plain evita o preflight de CORS (o Apps Script nao responde a OPTIONS)
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok: boolean; code?: string; message?: string; meetLink?: string };
    if (data.ok) return { ok: true, meetLink: data.meetLink };
    const code = data.code === 'taken' || data.code === 'invalid' ? data.code : 'server';
    return { ok: false, code, message: data.message ?? 'Não foi possível concluir o agendamento.' };
  } catch {
    return { ok: false, code: 'network', message: 'Falha de conexão. Verifique sua internet e tente novamente.' };
  }
}

/** Data de hoje (YYYY-MM-DD) no fuso de Sao Paulo. */
export function todayInSaoPaulo(): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: scheduleConfig.timeZone });
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
