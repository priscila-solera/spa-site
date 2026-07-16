function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAppointmentEmail({ nombre, email, telefono, servicio, horario, mensaje }) {
  const safe = {
    nombre: escapeHtml(nombre),
    email: escapeHtml(email),
    telefono: escapeHtml(telefono),
    servicio: escapeHtml(servicio),
    horario: escapeHtml(horario),
    mensaje: escapeHtml(mensaje).replace(/\n/g, '<br />'),
  };

  const detailRow = (label, value, last = false) => `
    <tr>
      <td style="padding:14px 0;${last ? '' : 'border-bottom:1px solid #ebe2d4;'}">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#a89885;font-family:Arial,Helvetica,sans-serif;">
          ${label}
        </p>
        <p style="margin:0;font-size:15px;line-height:1.5;color:#1C2B22;font-family:Georgia,'Times New Roman',serif;">
          ${value}
        </p>
      </td>
    </tr>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva solicitud de cita</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f1eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#fefdfb;border-radius:16px;overflow:hidden;border:1px solid #e8e2d8;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1C2B22;padding:32px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#d4c4a8;font-family:Arial,Helvetica,sans-serif;">
                Blue Royale Spa
              </p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:#fefdfb;font-family:Georgia,'Times New Roman',serif;">
                Nueva solicitud de cita
              </h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:#c4b8a8;font-family:Arial,Helvetica,sans-serif;">
                Un cliente acaba de enviar una solicitud desde la web
              </p>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:4px;background-color:#b8956e;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${detailRow('Nombre', safe.nombre)}
                ${detailRow('Correo', `<a href="mailto:${safe.email}" style="color:#1C2B22;text-decoration:underline;">${safe.email}</a>`)}
                ${detailRow('Teléfono', `<a href="tel:${safe.telefono}" style="color:#1C2B22;text-decoration:underline;">${safe.telefono}</a>`)}
                ${detailRow('Servicio de interés', safe.servicio)}
                ${detailRow('Horario preferido', safe.horario, true)}
              </table>

              <!-- Notes card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;background-color:#faf6ef;border-radius:12px;border:1px solid #ebe2d4;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#a89885;font-family:Arial,Helvetica,sans-serif;">
                      Notas adicionales
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.65;color:#554d44;font-family:Georgia,'Times New Roman',serif;">
                      ${safe.mensaje}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${safe.email}" style="display:inline-block;padding:14px 28px;background-color:#b8956e;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
                      Responder a ${safe.nombre}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;background-color:#fdfbf7;border-top:1px solid #ebe2d4;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a89885;font-family:Arial,Helvetica,sans-serif;">
                Solicitud enviada desde
                <a href="https://www.blueroyalespa.com" style="color:#8b7049;text-decoration:none;">blueroyalespa.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email, telefono, servicio, horario, mensaje, website } = req.body;

  // Honeypot anti-spam
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es requerido.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Un correo electrónico válido es requerido.' });
  }
  if (!telefono || !telefono.trim()) {
    return res.status(400).json({ error: 'El teléfono es requerido.' });
  }
  if (!servicio || !servicio.trim()) {
    return res.status(400).json({ error: 'El servicio es requerido.' });
  }
  if (!horario || !horario.trim()) {
    return res.status(400).json({ error: 'El horario preferido es requerido.' });
  }
  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Las notas adicionales son requeridas.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL ?? 'priscilasolera@blueroyalespa.com';
  const fromEmail = process.env.RESEND_FROM ?? 'Blue Royale Spa <noreply@blueroyalespa.com>';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurado');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  const emailHtml = buildAppointmentEmail({
    nombre: nombre.trim(),
    email: email.trim(),
    telefono: telefono.trim(),
    servicio: servicio.trim(),
    horario: horario.trim(),
    mensaje: mensaje.trim(),
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contactEmail],
      reply_to: email.trim(),
      subject: `Solicitud de cita de ${nombre.trim()} — ${servicio.trim()}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Resend error:', response.status, err);
    return res.status(500).json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' });
  }

  return res.status(200).json({ success: true });
}
