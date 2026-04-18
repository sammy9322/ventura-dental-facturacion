import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendComprobanteEmail(pago: any): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email no configurado (GMAIL_USER / GMAIL_APP_PASSWORD faltantes en .env)');
    return;
  }

  const cuota = pago.detalles?.find((d: any) => d.es_cuota_principal);
  const serviciosAdicionales = pago.detalles?.filter((d: any) => !d.es_cuota_principal) ?? [];
  const saldoRestante = pago.tratamiento_monto_total
    ? (pago.tratamiento_monto_total - pago.tratamiento_monto_pagado)
    : null;

  const formatMoney = (n: number) => `S/ ${Number(n).toFixed(2)}`;
  const fechaFormateada = new Date(pago.finalizado_at || pago.created_at).toLocaleString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const detallesHtml = pago.detalles?.map((d: any) => `
    <tr>
      <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0;">
        ${d.es_cuota_principal ? '🦷 ' : '➕ '}${d.descripcion}
      </td>
      <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:600;">
        ${formatMoney(d.monto)}
      </td>
    </tr>
  `).join('') ?? '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f1f5f9; margin:0; padding:20px;">
  <div style="max-width:580px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6); padding:28px 32px; color:white;">
      <h1 style="margin:0; font-size:22px; font-weight:700;">🦷 Ventura Dental</h1>
      <p style="margin:6px 0 0; opacity:0.85; font-size:14px;">Comprobante de Pago</p>
    </div>

    <div style="padding:28px 32px;">
      <div style="background:#eff6ff; border-radius:8px; padding:16px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div>
            <p style="margin:0; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.05em;">Comprobante N°</p>
            <p style="margin:4px 0 0; font-weight:700; font-size:18px; color:#1e40af;">#${pago.comprobante_numero || 'PENDIENTE'}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.05em;">Fecha</p>
            <p style="margin:4px 0 0; font-size:13px; color:#334155;">${fechaFormateada}</p>
          </div>
        </div>
      </div>

      <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin:0 0 12px;">Paciente</h3>
      <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#1e293b;">${pago.paciente_nombre}</p>
      <p style="margin:0 0 20px; font-size:13px; color:#64748b;">DNI: ${pago.paciente_dni || 'N/A'}</p>

      <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin:0 0 12px;">Atendido por</h3>
      <p style="margin:0 0 20px; font-size:14px; color:#334155;">${pago.doctor_nombre || 'N/A'}</p>

      ${cuota ? `
      <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin:0 0 12px;">Tratamiento Principal</h3>
      <div style="background:#f8fafc; border-radius:8px; padding:14px 16px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:#64748b; font-size:13px;">Monto total del tratamiento</span>
          <span style="font-weight:600;">${formatMoney(pago.tratamiento_monto_total)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:#64748b; font-size:13px;">Total abonado (incluye este pago)</span>
          <span style="font-weight:600; color:#059669;">${formatMoney(pago.tratamiento_monto_pagado)}</span>
        </div>
        ${saldoRestante !== null ? `
        <div style="border-top:1px solid #e2e8f0; margin:8px 0; padding-top:8px; display:flex; justify-content:space-between;">
          <span style="font-weight:700;">Saldo pendiente</span>
          <span style="font-weight:700; color:${saldoRestante > 0 ? '#dc2626' : '#059669'};">${formatMoney(saldoRestante)}</span>
        </div>` : ''}
      </div>` : ''}

      <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin:0 0 12px;">Detalle del Pago</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px; text-align:left; font-size:12px; color:#64748b;">Descripción</th>
            <th style="padding:8px 12px; text-align:right; font-size:12px; color:#64748b;">Monto</th>
          </tr>
        </thead>
        <tbody>${detallesHtml}</tbody>
        <tfoot>
          <tr style="background:#eff6ff;">
            <td style="padding:10px 12px; font-weight:700; font-size:15px;">TOTAL PAGADO</td>
            <td style="padding:10px 12px; text-align:right; font-weight:800; font-size:18px; color:#1e40af;">${formatMoney(pago.monto)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size:11px; color:#94a3b8; text-align:center; margin:0;">
        Este comprobante es válido como constancia de pago. Para consultas, contáctenos.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"Ventura Dental" <${process.env.GMAIL_USER}>`,
    to: pago.paciente_email,
    subject: `Comprobante de Pago #${pago.comprobante_numero} — Ventura Dental`,
    html,
  });

  console.log(`✓ Email enviado a ${pago.paciente_email}`);
}
