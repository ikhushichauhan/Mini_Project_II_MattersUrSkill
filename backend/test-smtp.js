
require('dotenv').config();
const nodemailer = require('nodemailer');

const host  = process.env.EMAIL_HOST;
const port  = parseInt(process.env.EMAIL_PORT || '587', 10);
const secure = process.env.EMAIL_SECURE === 'true';
const user  = process.env.EMAIL_USER;
const pass  = process.env.EMAIL_PASSWORD;
const from  = process.env.BREVO_SENDER_EMAIL;

console.log('');
console.log('=== SMTP Credential Test ===');
console.log(`  HOST:   ${host}`);
console.log(`  PORT:   ${port}`);
console.log(`  SECURE: ${secure}`);
console.log(`  USER:   ${user}`);
console.log(`  PASS:   ${pass ? pass.substring(0, 12) + '...' + pass.substring(pass.length - 8) : '(not set)'}`);
console.log(`  FROM:   ${from}`);
console.log('');

if (!host || !user || !pass) {
  console.error(' Missing EMAIL_HOST, EMAIL_USER, or EMAIL_PASSWORD in .env');
  process.exit(1);
}

(async () => {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  console.log('Step 1: Verifying SMTP connection & authentication...');
  try {
    await transporter.verify();
    console.log(' SMTP authentication successful!\n');
  } catch (err) {
    console.error(' SMTP authentication FAILED:', err.message);
    console.error('');
    console.error(' Your EMAIL_PASSWORD (SMTP key) is being rejected by Brevo.');
    console.error('   Go to: app.brevo.com  SMTP & API  Your SMTP Keys');
    console.error('   Generate a NEW key, copy it, and paste as EMAIL_PASSWORD in .env');
    process.exit(1);
  }

  const testRecipient = 'nibici2343@flosek.com';
  console.log(`Step 2: Sending test email to ${testRecipient}...`);
  try {
    const info = await transporter.sendMail({
      from: `"MattersUrSkills Test" <${from}>`,
      to: "nibici2343@flosek.com",
      subject: 'SMTP Test  MattersUrSkills',
      html: '<h2> SMTP is working!</h2><p>If you see this email, your OTP delivery is configured correctly.</p>',
    });
    console.log(` Test email sent! messageId: ${info.messageId}`);
    console.log('   Check your inbox (and spam folder).');
  } catch (err) {
    console.error(' Sending failed:', err.message);
  }

  process.exit(0);
})();