import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { scheduleConfig } from '@/constants/schedule';
import { colors, fonts } from '@/constants/theme';
import { addDays, todayInSaoPaulo, weekdayOf } from '@/lib/schedule-api';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

type Props = { value: string | null; onChange: (iso: string) => void };

/** Calendario mensal proprio (sem dependencias nativas) que respeita as regras de scheduleConfig. */
export function Calendar({ value, onChange }: Props) {
  const today = todayInSaoPaulo();
  const minDate = addDays(today, scheduleConfig.minDaysAhead);
  const maxDate = addDays(today, scheduleConfig.maxDaysAhead);

  const [cursor, setCursor] = useState(() => {
    const [y, m] = (value ?? minDate).split('-').map(Number);
    return { y, m: m - 1 };
  });

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(cursor.y, cursor.m, 1));
    const lead = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
    const out: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(`${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const canPrev = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-01` > minDate.slice(0, 8) + '01';
  const canNext = (() => {
    const nextMonthFirst = new Date(Date.UTC(cursor.y, cursor.m + 1, 1)).toISOString().slice(0, 10);
    return nextMonthFirst <= maxDate;
  })();

  const move = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  const isEnabled = (iso: string) =>
    iso >= minDate && iso <= maxDate && (scheduleConfig.weekdays as readonly number[]).includes(weekdayOf(iso));

  return (
    <View>
      <View style={styles.head}>
        <NavButton label="<" disabled={!canPrev} onPress={() => move(-1)} a11y="Mês anterior" />
        <Text style={styles.month}>{`${MONTHS[cursor.m]} ${cursor.y}`}</Text>
        <NavButton label=">" disabled={!canNext} onPress={() => move(1)} a11y="Próximo mês" />
      </View>
      <View style={styles.weekRow}>
        {WEEK.map((w, i) => (
          <Text key={i} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((iso, i) => {
          if (!iso) return <View key={`e${i}`} style={styles.cell} />;
          const enabled = isEnabled(iso);
          const selected = iso === value;
          const isToday = iso === today;
          return (
            <View key={iso} style={styles.cell}>
              <DayButton
                label={`Dia ${Number(iso.slice(-2))} de ${MONTHS[cursor.m]}`}
                day={Number(iso.slice(-2))}
                enabled={enabled}
                selected={selected}
                isToday={isToday}
                onPress={() => onChange(iso)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

type DayProps = { label: string; day: number; enabled: boolean; selected: boolean; isToday: boolean; onPress: () => void };

function DayButton({ label, day, enabled, selected, isToday, onPress }: DayProps) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled, selected }}
      disabled={!enabled}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[styles.day, isToday && styles.today, enabled && hover && !selected && styles.dayHover, selected && styles.daySelected]}>
      <Text style={[styles.dayText, !enabled && styles.dayOff, selected && styles.dayTextSelected]}>{day}</Text>
    </Pressable>
  );
}

function NavButton({ label, disabled, onPress, a11y }: { label: string; disabled: boolean; onPress: () => void; a11y: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} disabled={disabled} onPress={onPress} style={[styles.nav, disabled && { opacity: 0.25 }]}>
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  month: { fontFamily: fonts.display, fontSize: 20, color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },
  nav: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lineStrong },
  navText: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint, paddingBottom: 8, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  today: { borderColor: colors.line },
  dayHover: { borderColor: colors.text },
  daySelected: { backgroundColor: colors.red, borderColor: colors.red },
  dayText: { fontFamily: fonts.mono, fontSize: 14, color: colors.text },
  dayOff: { color: 'rgba(242,242,240,0.18)' },
  dayTextSelected: { color: colors.bg, fontFamily: fonts.monoMedium },
});
