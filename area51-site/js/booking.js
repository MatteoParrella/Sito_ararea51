/* ══════════════════════════════════════════════════════
   AREA 51 — js/booking.js
   Supabase save + form validation + date checks
   Used by: index.html, contatti.html
   ══════════════════════════════════════════════════════ */
'use strict';

/* ── CONFIG ── */
const SB_URL = 'https://dnyuexpvfoknjsxdqvzl.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueXVleHB2Zm9rbmpzeGRxdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDcwMTQsImV4cCI6MjA4ODIyMzAxNH0.VfLoEzHxs5CcliUtmSJdEygS4Ofl7wr2Z55ZrWCGZQ4';

async function salvaPrenotazione(payload) {
  try {
    const res = await fetch(SB_URL + '/rest/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.warn('Supabase non raggiungibile', e);
    return false;
  }
}

/* ── DATA MINIMA ── */
const oggi = new Date();
oggi.setHours(0, 0, 0, 0);
const $dataInput = document.getElementById('data');
if ($dataInput) $dataInput.min = oggi.toISOString().split('T')[0];

/* ── HELPERS ── */
const $v = id => document.getElementById(id);

/* ── PRENOTA ── */
window.prenota = async function () {
  const err = $v('f-err');
  if (err) err.style.display = 'none';

  const v = {
    nome:      $v('nome')?.value.trim()      || '',
    cognome:   $v('cognome')?.value.trim()   || '',
    telefono:  $v('telefono')?.value.trim()  || '',
    email:     $v('email')?.value.trim()     || '',
    data:      $v('data')?.value             || '',
    ora:       $v('ora')?.value              || '',
    persone:   $v('persone')?.value          || '',
    occasione: $v('occasione')?.value        || '',
    note:      $v('note')?.value.trim()      || ''
  };

  if (!v.nome || !v.cognome || !v.telefono || !v.data || !v.ora || !v.persone) {
    if (err) { err.textContent = 'Compila tutti i campi obbligatori (*).'; err.style.display = 'block'; err.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }

  const [y, m, d] = v.data.split('-').map(Number);
  const dataObj = new Date(y, m - 1, d);
  dataObj.setHours(0, 0, 0, 0);

  if (dataObj < oggi) {
    if (err) { err.textContent = 'Seleziona una data futura.'; err.style.display = 'block'; }
    return;
  }
  if (dataObj.getDay() === 0) {
    if (err) { err.textContent = 'Siamo chiusi la domenica. Scegli un altro giorno.'; err.style.display = 'block'; }
    return;
  }

  const btn = $v('btnSubmit');
  if (btn) { btn.disabled = true; btn.textContent = 'Invio in corso…'; }

  await salvaPrenotazione({
    nome: v.nome, cognome: v.cognome,
    telefono: v.telefono, email: v.email || null,
    data: v.data, ora: v.ora,
    persone: parseInt(v.persone),
    occasione: v.occasione || null,
    note: v.note || null
  });

  const dataFmt = dataObj.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const confMsg = $v('conf-msg');
  if (confMsg) {
    confMsg.innerHTML =
      `<strong>${v.nome} ${v.cognome}</strong> — ${dataFmt} alle <strong>${v.ora}</strong> ` +
      `per <strong>${v.persone} ${parseInt(v.persone) === 1 ? 'persona' : 'persone'}</strong>` +
      (v.occasione ? ` · ${v.occasione}` : '') + '.';
  }

  const fw = $v('formWrap');
  const conf = $v('conferma');
  if (fw) fw.style.display = 'none';
  if (conf) { conf.classList.add('show'); conf.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
};

window.nuovaPrenota = function () {
  $v('conferma')?.classList.remove('show');
  const fw = $v('formWrap');
  if (fw) fw.style.display = 'block';
  ['nome','cognome','telefono','email','note'].forEach(id => { const el = $v(id); if (el) el.value = ''; });
  ['ora','persone','occasione'].forEach(id => { const el = $v(id); if (el) el.selectedIndex = 0; });
  const dataEl = $v('data');
  if (dataEl) dataEl.value = '';
  const btn = $v('btnSubmit');
  if (btn) { btn.disabled = false; btn.textContent = 'Conferma Prenotazione'; }
  $v('prenotazione')?.scrollIntoView({ behavior: 'smooth' });
};
