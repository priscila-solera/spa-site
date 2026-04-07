import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nombre = formData.get('nombre')?.toString().trim() ?? '';
  const servicio = formData.get('servicio')?.toString().trim() ?? '';
  const horario = formData.get('horario')?.toString().trim() ?? '';
  const mensaje = formData.get('mensaje')?.toString().trim() ?? '';
  const website = formData.get('website')?.toString() ?? ''; // honeypot

  if (website) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!nombre) {
    return new Response(JSON.stringify({ error: 'El nombre es requerido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const contactEmail = import.meta.env.CONTACT_EMAIL ?? 'blueroyalespa@gmail.com';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurado');
    return new Response(JSON.stringify({ error: 'Error de configuración del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailHtml = `
    <h2>Nueva solicitud de cita — Blue Royale Spa</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Servicio de interés:</strong> ${servicio || 'No especificado'}</p>
    <p><strong>Horario preferido:</strong> ${horario || 'No especificado'}</p>
    <p><strong>Notas:</strong> ${mensaje || 'Ninguna'}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
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

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', res.status, err);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
