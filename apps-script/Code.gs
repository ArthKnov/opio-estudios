/**
 * ØPIO ESTÚDIOS: backend de agendamento de visitas (Google Apps Script).
 *
 * O que faz:
 *  - GET  ?action=busy&date=YYYY-MM-DD  -> lista os horarios (HH:mm) ja ocupados naquele dia.
 *  - POST (JSON em text/plain)           -> cria um evento no Google Calendar com link do Google Meet,
 *                                           convida o visitante (e o dono, se for outra conta) e envia um
 *                                           e-mail de aviso para OWNER_EMAIL com todos os dados.
 *
 * Variavel de ambiente (Propriedades do script):
 *  - OWNER_EMAIL: e-mail que recebe o aviso/convite. Nada disso fica no site publico.
 *
 * Mantenha CONFIG igual ao arquivo src/constants/schedule.ts do site.
 * Passo a passo de instalacao: veja apps-script/README.md.
 */

var CONFIG = {
  weekdays: [1, 2, 3, 4, 5, 6], // 0 = domingo ... 6 = sabado
  slots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  durationMinutes: 45,
  minDaysAhead: 1,
  maxDaysAhead: 45,
  timeZone: 'America/Sao_Paulo',
  calendarId: 'primary',
  // Eventos de dia inteiro (feriados, aniversarios...) bloqueiam o dia?
  blockAllDayEvents: false,
  eventTitlePrefix: 'Visita virtual ØPIO ESTÚDIOS',
};

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.action === 'busy') {
      var date = String(p.date || '');
      if (!isValidDate_(date)) return json_({ ok: false, code: 'invalid', message: 'Data inválida.' });
      return json_({ ok: true, busy: busySlots_(date) });
    }
    return json_({ ok: true, service: 'opio-estudios-agendamento' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, code: 'server', message: 'Erro interno.' });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: bots preenchem o campo escondido. Respondemos "ok" sem criar nada.
    if (data.website) return json_({ ok: true });

    var v = validate_(data);
    if (!v.ok) return json_({ ok: false, code: 'invalid', message: v.message });
    var b = v.value;

    // Limite simples por e-mail (1 pedido a cada 60s).
    var cache = CacheService.getScriptCache();
    var rlKey = 'rl_' + b.email;
    if (cache.get(rlKey)) {
      return json_({ ok: false, code: 'invalid', message: 'Aguarde um minuto antes de tentar novamente.' });
    }

    lock.waitLock(20000);

    // Revalida a disponibilidade dentro do lock (evita dois agendamentos no mesmo horario).
    if (busySlots_(b.date).indexOf(b.time) !== -1) {
      return json_({ ok: false, code: 'taken', message: 'Esse horário acabou de ser reservado. Escolha outro, por favor.' });
    }

    var result = createEvent_(b);
    cache.put(rlKey, '1', 60);

    try {
      notifyOwner_(b, result);
    } catch (mailErr) {
      console.error('Falha ao avisar o dono: ' + mailErr);
    }

    return json_({ ok: true, meetLink: result.meetLink });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, code: 'server', message: 'Não foi possível concluir o agendamento. Tente novamente em instantes.' });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}

/* ------------------------------------------------------------------ */
/* Validacao                                                           */
/* ------------------------------------------------------------------ */

function validate_(d) {
  var name = clean_(d.name, 80);
  var email = clean_(d.email, 120).toLowerCase();
  var phone = clean_(d.phone, 30);
  var message = clean_(d.message, 500);
  var date = String(d.date || '');
  var time = String(d.time || '');
  var interest = Array.isArray(d.interest)
    ? d.interest.slice(0, 8).map(function (i) {
        return clean_(i, 40);
      })
    : [];

  if (name.length < 3) return { ok: false, message: 'Informe seu nome completo.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: 'Informe um e-mail válido.' };
  if (phone.replace(/\D/g, '').length < 10) return { ok: false, message: 'Informe um telefone com DDD.' };
  if (!isValidDate_(date)) return { ok: false, message: 'Data inválida.' };
  if (CONFIG.slots.indexOf(time) === -1) return { ok: false, message: 'Horário inválido.' };

  var weekday = weekdayOf_(date);
  if (CONFIG.weekdays.indexOf(weekday) === -1) return { ok: false, message: 'Não atendemos nesse dia da semana.' };

  var today = todayStr_();
  var min = addDays_(today, CONFIG.minDaysAhead);
  var max = addDays_(today, CONFIG.maxDaysAhead);
  if (date < min || date > max) return { ok: false, message: 'Essa data está fora do período disponível.' };

  return { ok: true, value: { name: name, email: email, phone: phone, message: message, date: date, time: time, interest: interest } };
}

function clean_(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

function isValidDate_(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z'));
}

function todayStr_() {
  return Utilities.formatDate(new Date(), CONFIG.timeZone, 'yyyy-MM-dd');
}

function addDays_(iso, days) {
  var p = iso.split('-').map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + days));
  return d.toISOString().slice(0, 10);
}

function weekdayOf_(iso) {
  var p = iso.split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
}

/** Instante (Date) de "YYYY-MM-DD" + "HH:mm" no fuso configurado. */
function instant_(date, time) {
  return Utilities.parseDate(date + ' ' + time, CONFIG.timeZone, 'yyyy-MM-dd HH:mm');
}

/* ------------------------------------------------------------------ */
/* Calendario                                                          */
/* ------------------------------------------------------------------ */

function busySlots_(date) {
  var dayStart = instant_(date, '00:00');
  var dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  var items = [];
  var pageToken;
  do {
    var res = Calendar.Events.list(CONFIG.calendarId, {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
      maxResults: 250,
      pageToken: pageToken,
    });
    items = items.concat(res.items || []);
    pageToken = res.nextPageToken;
  } while (pageToken);

  var blocking = items.filter(function (ev) {
    if (ev.status === 'cancelled') return false;
    if (ev.transparency === 'transparent') return false; // marcado como "livre"
    if (!ev.start || !ev.start.dateTime) return CONFIG.blockAllDayEvents; // dia inteiro
    return true;
  });

  var busy = [];
  CONFIG.slots.forEach(function (slot) {
    var s = instant_(date, slot).getTime();
    var e = s + CONFIG.durationMinutes * 60 * 1000;
    var clash = blocking.some(function (ev) {
      if (!ev.start || !ev.start.dateTime) return true; // dia inteiro bloqueando
      var es = new Date(ev.start.dateTime).getTime();
      var ee = new Date(ev.end.dateTime).getTime();
      return es < e && ee > s;
    });
    if (clash) busy.push(slot);
  });
  return busy;
}

function createEvent_(b) {
  var start = b.date + 'T' + b.time + ':00';
  var endDate = new Date(instant_(b.date, b.time).getTime() + CONFIG.durationMinutes * 60 * 1000);
  var end = Utilities.formatDate(endDate, CONFIG.timeZone, "yyyy-MM-dd'T'HH:mm:ss");

  var owner = getOwnerEmail_();
  var organizer = (Session.getEffectiveUser().getEmail() || '').toLowerCase();
  var attendees = [{ email: b.email, displayName: b.name }];
  if (owner.toLowerCase() !== organizer) attendees.push({ email: owner });

  var description = [
    'Visita virtual agendada pelo site da ØPIO ESTÚDIOS.',
    '',
    'Nome: ' + b.name,
    'E-mail: ' + b.email,
    'Telefone/WhatsApp: ' + b.phone,
    b.interest.length ? 'Interesse: ' + b.interest.join(', ') : null,
    b.message ? 'Mensagem: ' + b.message : null,
  ]
    .filter(function (l) {
      return l !== null;
    })
    .join('\n');

  var resource = {
    summary: CONFIG.eventTitlePrefix + ': ' + b.name,
    description: description,
    start: { dateTime: start, timeZone: CONFIG.timeZone },
    end: { dateTime: end, timeZone: CONFIG.timeZone },
    attendees: attendees,
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'email', minutes: 60 }] },
    conferenceData: {
      createRequest: {
        requestId: Utilities.getUuid(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  var created = Calendar.Events.insert(resource, CONFIG.calendarId, {
    conferenceDataVersion: 1,
    sendUpdates: 'all', // envia o convite por e-mail para os convidados
  });

  var meetLink = created.hangoutLink || meetFromConference_(created);
  if (!meetLink) {
    // A criacao do Meet pode ser assincrona: consulta de novo rapidamente.
    Utilities.sleep(1200);
    var again = Calendar.Events.get(CONFIG.calendarId, created.id);
    meetLink = again.hangoutLink || meetFromConference_(again) || '';
  }

  return { eventId: created.id, htmlLink: created.htmlLink, meetLink: meetLink };
}

function meetFromConference_(ev) {
  var eps = ev && ev.conferenceData && ev.conferenceData.entryPoints;
  if (!eps) return '';
  for (var i = 0; i < eps.length; i++) {
    if (eps[i].entryPointType === 'video') return eps[i].uri;
  }
  return '';
}

/* ------------------------------------------------------------------ */
/* E-mail para o dono                                                  */
/* ------------------------------------------------------------------ */

function getOwnerEmail_() {
  var email = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if (!email) throw new Error('Defina a propriedade OWNER_EMAIL em Configurações do projeto > Propriedades do script.');
  return email.trim();
}

function notifyOwner_(b, r) {
  var owner = getOwnerEmail_();
  var when = b.date.split('-').reverse().join('/') + ' às ' + b.time;
  var html =
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">' +
    '<h2 style="margin:0 0 12px">Nova visita agendada</h2>' +
    '<p><b>' + esc_(when) + '</b> (horário de Brasília), ' + CONFIG.durationMinutes + ' min</p>' +
    '<table cellpadding="4" style="border-collapse:collapse">' +
    row_('Nome', b.name) +
    row_('E-mail', b.email) +
    row_('Telefone/WhatsApp', b.phone) +
    (b.interest.length ? row_('Interesse', b.interest.join(', ')) : '') +
    (b.message ? row_('Mensagem', b.message) : '') +
    '</table>' +
    (r.meetLink ? '<p><a href="' + esc_(r.meetLink) + '"><b>Entrar no Google Meet</b></a><br>' + esc_(r.meetLink) + '</p>' : '') +
    (r.htmlLink ? '<p><a href="' + esc_(r.htmlLink) + '">Abrir no Google Agenda</a></p>' : '') +
    '</div>';

  MailApp.sendEmail({
    to: owner,
    subject: 'Nova visita agendada: ' + b.name + ' (' + when + ')',
    htmlBody: html,
    replyTo: b.email,
    name: 'Site ØPIO ESTÚDIOS',
  });
}

function row_(k, v) {
  return '<tr><td style="color:#666">' + esc_(k) + '</td><td><b>' + esc_(v) + '</b></td></tr>';
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* Utilitarios para voce rodar manualmente no editor                   */
/* ------------------------------------------------------------------ */

/** Rode uma vez no editor para autorizar as permissoes e validar a configuracao. */
function setup() {
  console.log('OWNER_EMAIL = ' + getOwnerEmail_());
  console.log('Conta executando = ' + Session.getEffectiveUser().getEmail());
  console.log('Horarios ocupados amanha = ' + JSON.stringify(busySlots_(addDays_(todayStr_(), 1))));
}
