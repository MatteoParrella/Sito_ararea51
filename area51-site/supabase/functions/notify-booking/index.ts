// supabase/functions/notify-booking/index.ts
// Edge Function: invia email al locale + conferma al cliente ad ogni prenotazione
// Deploy: supabase functions deploy notify-booking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const EMAIL_LOCALE   = 'parrellamatteo24@gmail.com'  // ← tua email
const SITE_URL       = 'https://area51vimercate.it'

serve(async (req) => {
  try {
    const payload = await req.json()
    const record  = payload.record  // dati della prenotazione

    const { nome, cognome, telefono, email, data, ora, persone, occasione, note } = record

    const dataFmt = new Date(data).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    // ── 1. EMAIL AL LOCALE ──────────────────────────────────────────
    await sendEmail({
      to:      EMAIL_LOCALE,
      subject: `🛸 Nuova prenotazione – ${nome} ${cognome} – ${dataFmt}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#faf8f4;padding:2rem;border-radius:8px;">
          <h2 style="color:#c8a96e;margin-bottom:1.5rem;">📋 Nuova Prenotazione</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:.5rem 0;color:#888;width:140px;">Cliente</td>
                <td style="padding:.5rem 0;font-weight:600;">${nome} ${cognome}</td></tr>
            <tr><td style="padding:.5rem 0;color:#888;">Telefono</td>
                <td style="padding:.5rem 0;"><a href="tel:${telefono}" style="color:#c8a96e;">${telefono}</a></td></tr>
            ${email ? `<tr><td style="padding:.5rem 0;color:#888;">Email</td>
                <td style="padding:.5rem 0;">${email}</td></tr>` : ''}
            <tr><td style="padding:.5rem 0;color:#888;">Data</td>
                <td style="padding:.5rem 0;font-weight:600;">${dataFmt}</td></tr>
            <tr><td style="padding:.5rem 0;color:#888;">Orario</td>
                <td style="padding:.5rem 0;font-weight:600;">${ora}</td></tr>
            <tr><td style="padding:.5rem 0;color:#888;">Persone</td>
                <td style="padding:.5rem 0;">${persone}</td></tr>
            ${occasione ? `<tr><td style="padding:.5rem 0;color:#888;">Occasione</td>
                <td style="padding:.5rem 0;">${occasione}</td></tr>` : ''}
            ${note ? `<tr><td style="padding:.5rem 0;color:#888;">Note</td>
                <td style="padding:.5rem 0;font-style:italic;">${note}</td></tr>` : ''}
          </table>
          <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #333;font-size:.8rem;color:#555;">
            Area 51 Bar · Vimercate · <a href="${SITE_URL}" style="color:#c8a96e;">area51vimercate.it</a>
          </div>
        </div>
      `
    })

    // ── 2. EMAIL DI CONFERMA AL CLIENTE (solo se ha lasciato email) ──
    if (email) {
      await sendEmail({
        to:      email,
        subject: `Prenotazione confermata – Area 51 Vimercate`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#faf8f4;padding:2rem;border-radius:8px;">
            <h2 style="color:#c8a96e;margin-bottom:.5rem;">✓ Prenotazione Ricevuta</h2>
            <p style="color:#888;margin-bottom:1.5rem;">Ciao <strong style="color:#faf8f4;">${nome}</strong>, abbiamo ricevuto la tua prenotazione!</p>
            <div style="background:#181818;border:1px solid #333;border-radius:6px;padding:1.5rem;margin-bottom:1.5rem;">
              <div style="margin-bottom:.7rem;"><span style="color:#888;font-size:.85rem;">Data</span><br/>
                <strong style="color:#c8a96e;font-size:1.1rem;">${dataFmt} alle ${ora}</strong></div>
              <div><span style="color:#888;font-size:.85rem;">Persone</span><br/>
                <strong>${persone} ${persone == 1 ? 'persona' : 'persone'}</strong></div>
              ${occasione ? `<div style="margin-top:.7rem;"><span style="color:#888;font-size:.85rem;">Occasione</span><br/><strong>${occasione}</strong></div>` : ''}
            </div>
            <p style="color:#888;font-size:.9rem;line-height:1.7;">
              Ti contatteremo al <strong style="color:#faf8f4;">${telefono}</strong> per confermare il tavolo.<br/>
              Per qualsiasi necessità chiamaci al <a href="tel:+393513473342" style="color:#c8a96e;">351 347 3342</a> 
              o scrivici su <a href="https://wa.me/393513473342" style="color:#c8a96e;">WhatsApp</a>.
            </p>
            <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #333;font-size:.8rem;color:#555;">
              <strong style="color:#c8a96e;">AREA 51</strong> · Bar & Street Food · SP45,1 Vimercate (MB)<br/>
              <a href="${SITE_URL}" style="color:#555;">area51vimercate.it</a>
            </div>
          </div>
        `
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

// ── HELPER RESEND ────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from:    'Area 51 Vimercate <noreply@area51vimercate.it>',
      to,
      subject,
      html
    })
  })
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`)
  return res.json()
} 