import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  template: string
  data?: Record<string, any>
  priority?: 'low' | 'medium' | 'high'
}

const EMAIL_TEMPLATES = {
  welcome: (data: any) => ({
    subject: `¡Bienvenido a Sunday Proto, ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">¡Bienvenido a Sunday Proto!</h1>
        <p>Hola ${data.name},</p>
        <p>Gracias por registrarte en Sunday Proto. Tu cuenta ha sido creada exitosamente.</p>
        <p>Para comenzar a usar la plataforma, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
        </p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo de Sunday Proto</p>
      </div>
    `
  }),

  email_verification: (data: any) => ({
    subject: 'Verifica tu email - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verifica tu Email</h1>
        <p>Hola ${data.name},</p>
        <p>Para completar tu registro en Sunday Proto, por favor verifica tu dirección de email:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
        </p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
      </div>
    `
  }),

  password_reset: (data: any) => ({
    subject: 'Restablece tu contraseña - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Restablecer Contraseña</h1>
        <p>Hola ${data.name},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
        </p>
        <p>Este enlace expirará en 1 hora por seguridad.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
      </div>
    `
  }),

  verification_approved: (data: any) => ({
    subject: '¡Verificación Aprobada! - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">¡Verificación Aprobada!</h1>
        <p>Hola ${data.name},</p>
        <p>¡Felicitaciones! Tu solicitud de verificación de identidad ha sido aprobada.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>Publicar propiedades en la plataforma</li>
          <li>Participar en negociaciones</li>
          <li>Acceder a todas las funcionalidades premium</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ir al Dashboard</a>
        </p>
      </div>
    `
  }),

  verification_rejected: (data: any) => ({
    subject: 'Verificación Rechazada - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Verificación Rechazada</h1>
        <p>Hola ${data.name},</p>
        <p>Lamentablemente, tu solicitud de verificación de identidad no pudo ser aprobada.</p>
        ${data.reason ? `<p><strong>Razón:</strong> ${data.reason}</p>` : ''}
        <p>Puedes corregir los documentos y enviar una nueva solicitud de verificación.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.profileUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ir a Mi Perfil</a>
        </p>
      </div>
    `
  }),

  property_approved: (data: any) => ({
    subject: '¡Propiedad Aprobada! - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">¡Propiedad Aprobada!</h1>
        <p>Hola ${data.name},</p>
        <p>Tu propiedad "${data.propertyTitle}" ha sido aprobada y ya está publicada en la plataforma.</p>
        <p>Ahora los usuarios pueden ver tu propiedad y hacer ofertas.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.propertyUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Propiedad</a>
        </p>
      </div>
    `
  }),

  property_rejected: (data: any) => ({
    subject: 'Propiedad Rechazada - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Propiedad Rechazada</h1>
        <p>Hola ${data.name},</p>
        <p>Tu propiedad "${data.propertyTitle}" no pudo ser aprobada.</p>
        ${data.reason ? `<p><strong>Razón:</strong> ${data.reason}</p>` : ''}
        <p>Puedes editar la propiedad y volver a enviarla para aprobación.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.editUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Editar Propiedad</a>
        </p>
      </div>
    `
  }),

  offer_received: (data: any) => ({
    subject: 'Nueva Oferta Recibida - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Nueva Oferta Recibida</h1>
        <p>Hola ${data.name},</p>
        <p>Has recibido una nueva oferta por tu propiedad "${data.propertyTitle}".</p>
        <p><strong>Monto ofrecido:</strong> ${data.amount}</p>
        <p><strong>Comprador:</strong> ${data.buyerName}</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.negotiationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Oferta</a>
        </p>
      </div>
    `
  }),

  offer_accepted: (data: any) => ({
    subject: '¡Oferta Aceptada! - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">¡Oferta Aceptada!</h1>
        <p>Hola ${data.name},</p>
        <p>¡Felicitaciones! Tu oferta por "${data.propertyTitle}" ha sido aceptada.</p>
        <p><strong>Monto acordado:</strong> ${data.amount}</p>
        <p>El proceso de negociación ha finalizado. Pronto recibirás más información sobre los siguientes pasos.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Detalles</a>
        </p>
      </div>
    `
  }),

  visit_reminder: (data: any) => ({
    subject: 'Recordatorio de Visita - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Recordatorio de Visita</h1>
        <p>Hola ${data.name},</p>
        <p>Te recordamos que tienes una visita programada:</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Propiedad:</strong> ${data.propertyTitle}</p>
          <p><strong>Fecha:</strong> ${data.date}</p>
          <p><strong>Hora:</strong> ${data.time}</p>
          <p><strong>Dirección:</strong> ${data.address}</p>
        </div>
        <p>Por favor llega 10 minutos antes de la hora programada.</p>
        ${data.virtualLink ? `<p><strong>Enlace virtual:</strong> <a href="${data.virtualLink}">${data.virtualLink}</a></p>` : ''}
      </div>
    `
  }),

  visit_cancelled: (data: any) => ({
    subject: 'Visita Cancelada - Sunday Proto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Visita Cancelada</h1>
        <p>Hola ${data.name},</p>
        <p>Tu visita programada ha sido cancelada.</p>
        <p><strong>Propiedad:</strong> ${data.propertyTitle}</p>
        <p><strong>Fecha original:</strong> ${data.date}</p>
        ${data.reason ? `<p><strong>Razón:</strong> ${data.reason}</p>` : ''}
        <p>Puedes programar una nueva visita cuando lo desees.</p>
      </div>
    `
  })
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the user from the JWT
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { to, subject, template, data, priority = 'medium' }: EmailRequest = await req.json()

    // Get template content
    const templateFn = EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES]
    if (!templateFn) {
      throw new Error(`Template ${template} not found`)
    }

    const { subject: emailSubject, html } = templateFn(data)

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log it and return success
    console.log('Email to send:', {
      to,
      subject: emailSubject,
      html,
      priority
    })

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'Sunday Proto <noreply@sundayproto.com>',
    //     to: [to],
    //     subject: emailSubject,
    //     html: html,
    //   }),
    // })

    // For now, simulate success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email queued for sending',
        email: { to, subject: emailSubject, template }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

