// ── CONFIG SUPABASE ──────────────────────────────────────────────────
const SB_URL = 'https://dnyuexpvfoknjsxdqvzl.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueXVleHB2Zm9rbmpzeGRxdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDcwMTQsImV4cCI6MjA4ODIyMzAxNH0.VfLoEzHxs5CcliUtmSJdEygS4Ofl7wr2Z55ZrWCGZQ4'

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
    })
    return res.ok
  } catch (e) {
    console.warn('Supabase non raggiungibile', e)
    return false
  }
}

// ── NAVBAR ───────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60)
}, { passive: true })

function toggleMenu() {
  const nav = document.getElementById('navCenter')
  nav.classList.contains('open') ? closeMenu() : openMenu()
}

function openMenu() {
  document.getElementById('navCenter').classList.add('open')
  document.getElementById('hamburger').classList.add('open')
  document.getElementById('navOverlay').classList.add('show')
  document.body.classList.add('menu-open')
}

function closeMenu() {
  document.getElementById('navCenter').classList.remove('open')
  document.getElementById('hamburger').classList.remove('open')
  document.getElementById('navOverlay').classList.remove('show')
  document.body.classList.remove('menu-open')
}

// ── CHIUDI MENU SUI LINK INTERNI ─────────────────────────────────────
// Attacca il closeMenu direttamente sui link del nav (non sull'overlay del documento)
// così non interferisce con il click e la navigazione avviene normalmente
document.querySelectorAll('#navCenter a').forEach(link => {
  link.addEventListener('click', () => {
    // Piccolo delay per permettere lo scroll-to-anchor prima di chiudere
    setTimeout(closeMenu, 80)
  })
})

// Chiudi con ESC
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu() })

// Chiudi cliccando/tappando sull'overlay (doppio listener per iOS)
document.getElementById('navOverlay').addEventListener('touchend', e => {
  e.preventDefault()
  closeMenu()
})

// ── MENU TABS ────────────────────────────────────────────────────────
function mostraTab(nome, btn) {
  document.querySelectorAll('.mgrid').forEach(g => g.classList.remove('on'))
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'))
  document.getElementById('t-' + nome).classList.add('on')
  btn.classList.add('on')
}

// ── FADE-UP SCROLL ───────────────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') })
}, { threshold: 0.08 })
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))

// ── DATA MINIMA ──────────────────────────────────────────────────────
const oggi = new Date()
oggi.setHours(0, 0, 0, 0)
document.getElementById('data').min = oggi.toISOString().split('T')[0]

// ── PRENOTAZIONE ─────────────────────────────────────────────────────
async function prenota() {
  const err = document.getElementById('f-err')
  err.style.display = 'none'

  const v = {
    nome:      document.getElementById('nome').value.trim(),
    cognome:   document.getElementById('cognome').value.trim(),
    telefono:  document.getElementById('telefono').value.trim(),
    email:     document.getElementById('email').value.trim(),
    data:      document.getElementById('data').value,
    ora:       document.getElementById('ora').value,
    persone:   document.getElementById('persone').value,
    occasione: document.getElementById('occasione').value,
    note:      document.getElementById('note').value.trim()
  }

  if (!v.nome || !v.cognome || !v.telefono || !v.data || !v.ora || !v.persone) {
    err.textContent = 'Compila tutti i campi obbligatori (*).'
    err.style.display = 'block'
    err.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  // Parsing data sicuro (evita bug timezone)
  const [y, m, d] = v.data.split('-').map(Number)
  const dataObj = new Date(y, m - 1, d)
  dataObj.setHours(0, 0, 0, 0)

  if (dataObj < oggi) {
    err.textContent = 'Seleziona una data futura.'; err.style.display = 'block'; return
  }
  if (dataObj.getDay() === 0) {
    err.textContent = 'Siamo chiusi la domenica. Scegli un altro giorno.'; err.style.display = 'block'; return
  }

  const btn = document.getElementById('btnSubmit')
  btn.disabled = true; btn.textContent = 'Invio in corso…'

  await salvaPrenotazione({
    nome: v.nome, cognome: v.cognome,
    telefono: v.telefono, email: v.email || null,
    data: v.data, ora: v.ora,
    persone: parseInt(v.persone),
    occasione: v.occasione || null,
    note: v.note || null
  })

  const dataFmt = dataObj.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  document.getElementById('conf-msg').innerHTML =
    `<strong>${v.nome} ${v.cognome}</strong> — ${dataFmt} alle <strong>${v.ora}</strong> ` +
    `per <strong>${v.persone} ${parseInt(v.persone) === 1 ? 'persona' : 'persone'}</strong>` +
    (v.occasione ? ` · ${v.occasione}` : '') + '.'

  document.getElementById('formWrap').style.display = 'none'
  const conf = document.getElementById('conferma')
  conf.classList.add('show')
  conf.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function nuovaPrenota() {
  document.getElementById('conferma').classList.remove('show')
  document.getElementById('formWrap').style.display = 'block'
  ;['nome','cognome','telefono','email','note'].forEach(id => document.getElementById(id).value = '')
  ;['ora','persone','occasione'].forEach(id => document.getElementById(id).selectedIndex = 0)
  document.getElementById('data').value = ''
  const btn = document.getElementById('btnSubmit')
  btn.disabled = false; btn.textContent = 'Conferma Prenotazione'
  document.getElementById('prenotazione').scrollIntoView({ behavior: 'smooth' })
}