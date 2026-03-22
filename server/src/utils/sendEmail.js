// ! For sending emails using Resend API
// sendEmail.js
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async function (to, subject, message) {
//   try {
//     const info = await resend.emails.send({
//       from: `${process.env.EMAIL_FROM_NAME || 'Security Alert'} <${process.env.EMAIL_FROM_EMAIL}>`,
//       to,
//       subject,
//       html: message,
//     });
    
//     console.log('Resend full response:', JSON.stringify(info, null, 2))

//     console.log('Email sent:', info.id);
//     return true;
//   } catch (error) {
//     console.error('Email failed:', error);
//     return false;
//   }
// };


// export default sendEmail;

// For sending emails using Brevo SMTP
import fetch from 'node-fetch'

/**
 * Sends an email via Brevo's REST API (port 443 — never blocked by ISPs)
 * @param {string} to      - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html    - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || 'Mern Blog',
        email: process.env.EMAIL_FROM_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Brevo API error: ${error.message || response.statusText}`)
  }

  return response.json()
}

export default sendEmail