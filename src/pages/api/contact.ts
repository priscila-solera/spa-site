import type { APIRoute } from 'astro';
import { Resend } from 'resend';

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

  // Honeypot: si viene con valor, es spam — responder 200 silenciosamente
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

  const resend = new Resend(apiKey);

  const emailHtml = `
    <h2>Nueva solicitud de cita — Blue Royale Spa</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Servicio de interés:</strong> ${servicio || 'No especificado'}</p>
    <p><strong>Horario preferido:</strong> ${horario || 'No especificado'}</p>
    <p><strong>Notas:</strong> ${mensaje || 'Ninguna'}</p>
  `;

  try {
    await resend.emails.send({
      from: 'Blue Royale Spa <onboarding@resend.dev>',
      to: contactEmail,
      subject: `Solicitud de cita de ${nombre} — ${servicio || 'Servicio general'}`,
      html: emailHtml,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error enviando email:', err);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
