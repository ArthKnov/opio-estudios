import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { PixelButton } from '@/components/ui/PixelButton';
import { brand, services } from '@/constants/content';
import { scheduleConfig } from '@/constants/schedule';
import { colors, fonts } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { createBooking, fetchBusySlots, isScheduleConfigured, type BookingResult } from '@/lib/schedule-api';

import { Calendar } from './Calendar';

const INTERESTS = ['Conhecer os estúdios', ...services.map((s) => s.title)];
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'date' | 'time', string>>;

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${d} de ${MONTHS_SHORT[m - 1]}`;
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formulario de agendamento: escolhe dia/horario, preenche os dados e dispara o convite do Google Meet. */
export function ScheduleForm() {
  const { isMobile } = useLayout();
  const twoCols = !isMobile;

  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState<string[]>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [interest, setInterest] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoadingBusy(true);
    setTime(null);
    fetchBusySlots(date).then((list) => {
      if (cancelled) return;
      setBusy(list);
      setLoadingBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const toggleInterest = (item: string) =>
    setInterest((cur) => (cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item]));

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = 'Informe seu nome completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'Informe um e-mail válido.';
    if (phone.replace(/\D/g, '').length < 10) e.phone = 'Informe um telefone com DDD.';
    if (!date) e.date = 'Escolha um dia no calendário.';
    else if (!time) e.time = 'Escolha um horário.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0 || !date || !time) return;
    setSubmitting(true);
    const res = await createBooking({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      interest,
      message: message.trim(),
      date,
      time,
      website,
    });
    setSubmitting(false);
    setResult(res);
    if (!res.ok && res.code === 'taken') {
      setBusy((cur) => [...cur, time]);
      setTime(null);
    }
  };

  const reset = () => {
    setResult(null);
    setDate(null);
    setTime(null);
    setMessage('');
    setInterest([]);
  };

  const slots = useMemo(() => scheduleConfig.slots.map((s) => ({ time: s, busy: busy.includes(s) })), [busy]);

  if (result?.ok && date && time) {
    return (
      <View style={styles.card}>
        <Text style={styles.successKicker}>{'● CONFIRMADO'}</Text>
        <Text style={styles.successTitle}>Visita agendada!</Text>
        <Text style={styles.successText}>
          {`${formatDate(date)} às ${time} (horário de Brasília).`}
          {'\n'}
          {`Enviamos o convite do Google Meet para ${email.trim().toLowerCase()}. Confira também a caixa de spam.`}
        </Text>
        <View style={styles.successActions}>
          {result.meetLink ? <PixelButton label="Abrir Google Meet" variant="red" href={result.meetLink} /> : null}
          <PixelButton label="Agendar outro horário" onPress={reset} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: twoCols ? 'row' : 'column', gap: twoCols ? 48 : 36 }}>
        {/* Passo 1: data e horario */}
        <View style={{ flex: twoCols ? 1 : undefined }}>
          <StepLabel n="01" text="Escolha o dia e o horário" />
          <Calendar value={date} onChange={setDate} />
          {errors.date ? <ErrorText text={errors.date} /> : null}

          <Text style={[styles.label, { marginTop: 22 }]}>
            {date ? `Horários em ${formatDate(date)}` : 'Horários disponíveis'}
          </Text>
          {date ? (
            <View style={styles.slots}>
              {slots.map((s) => {
                const selected = time === s.time;
                return (
                  <Pressable
                    key={s.time}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: s.busy, selected }}
                    disabled={s.busy || loadingBusy}
                    onPress={() => setTime(s.time)}
                    style={[styles.slot, selected && styles.slotOn, (s.busy || loadingBusy) && { opacity: 0.3 }]}>
                    <Text style={[styles.slotText, selected && { color: colors.bg }, s.busy && { textDecorationLine: 'line-through' }]}>{s.time}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.hint}>Selecione um dia para ver os horários.</Text>
          )}
          {errors.time ? <ErrorText text={errors.time} /> : null}
          <Text style={styles.hint}>{`Encontro online pelo Google Meet · ${scheduleConfig.durationMinutes} min · horário de Brasília`}</Text>
        </View>

        {/* Passo 2: dados */}
        <View style={{ flex: twoCols ? 1 : undefined, gap: 18 }}>
          <StepLabel n="02" text="Seus dados" />
          <Field label="Nome completo" value={name} onChangeText={setName} error={errors.name} autoComplete="name" textContentType="name" />
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Field
            label="WhatsApp / telefone"
            value={phone}
            onChangeText={(t) => setPhone(formatPhone(t))}
            error={errors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="(11) 90000-0000"
          />
          <View>
            <Text style={styles.label}>Interesse (opcional)</Text>
            <View style={styles.chips}>
              {INTERESTS.map((item) => {
                const on = interest.includes(item);
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => toggleInterest(item)}
                    style={[styles.chip, on && styles.chipOn]}>
                    <Text style={[styles.chipText, on && { color: colors.bg }]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Field label="Mensagem (opcional)" value={message} onChangeText={setMessage} multiline numberOfLines={3} maxLength={500} />

          {/* honeypot: invisivel para pessoas, bots costumam preencher */}
          <View style={styles.honey} aria-hidden importantForAccessibility="no-hide-descendants">
            <TextInput
              value={website}
              onChangeText={setWebsite}
              tabIndex={-1}
              autoComplete="off"
              accessibilityElementsHidden
              style={{ height: 1, width: 1 }}
            />
          </View>
        </View>
      </View>

      {!isScheduleConfigured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            O agendamento online está sendo configurado. Enquanto isso, fale com a gente pelo WhatsApp.
          </Text>
          <PixelButton label="Chamar no WhatsApp" variant="red" href={brand.whatsapp} />
        </View>
      ) : (
        <View style={{ marginTop: 34, gap: 14 }}>
          {result && !result.ok ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{result.message}</Text>
            </View>
          ) : null}
          <PixelButton label={submitting ? 'Enviando' : 'Agendar e receber convite'} variant="red" size="lg" loading={submitting} disabled={submitting} onPress={submit} />
          <Text style={styles.hint}>Ao enviar, você recebe o convite do Google Meet no e-mail informado.</Text>
        </View>
      )}
    </View>
  );
}

function StepLabel({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepN}>{n}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function ErrorText({ text }: { text: string }) {
  return <Text style={styles.error}>{text}</Text>;
}

type FieldProps = TextInputProps & { label: string; error?: string };

function Field({ label, error, style, multiline, ...rest }: FieldProps) {
  const [focus, setFocus] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={colors.textFaint}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[
          styles.input,
          multiline && { minHeight: 88, textAlignVertical: 'top' },
          focus && { borderColor: colors.red },
          !!error && { borderColor: colors.red },
          style,
          { outlineStyle: 'none' } as object,
        ]}
      />
      {error ? <ErrorText text={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: 'rgba(8,10,10,0.82)', padding: 26 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  stepN: { fontFamily: fonts.mono, fontSize: 13, color: colors.red },
  stepText: { fontFamily: fonts.display, fontSize: 22, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  label: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  error: { fontFamily: fonts.mono, fontSize: 12, color: colors.red, marginTop: 6 },
  hint: { fontFamily: fonts.mono, fontSize: 12, color: colors.textFaint, marginTop: 10, lineHeight: 18 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { borderWidth: 1, borderColor: colors.lineStrong, paddingVertical: 10, paddingHorizontal: 14, minWidth: 70, alignItems: 'center' },
  slotOn: { backgroundColor: colors.red, borderColor: colors.red },
  slotText: { fontFamily: fonts.mono, fontSize: 14, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, paddingVertical: 8, paddingHorizontal: 12 },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim },
  honey: { position: 'absolute', left: -9999, top: 0, width: 1, height: 1, opacity: 0 },
  notice: { marginTop: 30, gap: 16, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 22 },
  noticeText: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 21, color: colors.textDim },
  errorBox: { borderWidth: 1, borderColor: colors.red, padding: 12, backgroundColor: 'rgba(255,42,42,0.08)' },
  errorBoxText: { fontFamily: fonts.mono, fontSize: 13, color: colors.text, lineHeight: 20 },
  successKicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.red, letterSpacing: 3 },
  successTitle: { fontFamily: fonts.display, fontSize: 40, color: colors.text, textTransform: 'uppercase', marginTop: 8, marginBottom: 14 },
  successText: { fontFamily: fonts.mono, fontSize: 14, lineHeight: 24, color: colors.textDim, maxWidth: 560 },
  successActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 26 },
});
