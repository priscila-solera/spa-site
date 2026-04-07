export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, servicio, horario, mensaje, website } = req.body;

  // Honeypot anti-spam
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es requerido.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL ?? 'blueroyalespa@gmail.com';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurado');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  const emailHtml = `
    <h2>Nueva solicitud de cita — Blue Royale Spa</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Servicio de interés:</strong> ${servicio || 'No especificado'}</p>
    <p><strong>Horario preferido:</strong> ${horario || 'No especificado'}</p>
    <p><strong>Notas:</strong> ${mensaje || 'Ninguna'}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Blue Royale Spa <onboarding@resend.dev>',
      to: [contactEmail],
      subject: `Solicitud de cita de ${nombre} — ${servicio || 'Servicio general'}`,
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
