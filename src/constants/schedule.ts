/**
 * Regras de disponibilidade para o agendamento de visitas (Google Meet).
 * IMPORTANTE: mantenha estes valores iguais aos de `apps-script/Code.gs` (CONFIG).
 * O servidor (Apps Script) sempre revalida tudo antes de criar o evento.
 */
export const scheduleConfig = {
  /** Dias da semana liberados (0 = domingo ... 6 = sabado). */
  weekdays: [1, 2, 3, 4, 5, 6],
  /** Horarios de inicio liberados (HH:mm, horario de Sao Paulo). */
  slots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  /** Duracao da visita/reuniao em minutos. */
  durationMinutes: 45,
  /** Antecedencia minima (em dias) e janela maxima de agendamento. */
  minDaysAhead: 1,
  maxDaysAhead: 45,
  timeZone: 'America/Sao_Paulo',
} as const;

/**
 * URL do Web App do Google Apps Script (veja apps-script/README.md).
 * Use "mock" para testar a interface sem o backend.
 */
export const scheduleEndpoint = process.env.EXPO_PUBLIC_SCHEDULE_ENDPOINT ?? '';
