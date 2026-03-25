const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize the email transporter.
 * Uses Ethereal (fake SMTP) for development/testing.
 * To switch to Gmail, update the .env with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if real SMTP credentials are configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✅ Email configured with custom SMTP');
    console.log(`   User: ${process.env.SMTP_USER}`);
  } else {
    // Use Ethereal (free fake SMTP for testing)
    console.log('⚠️  Real SMTP not configured. Using Ethereal test mode...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal test account created successfully');
    console.log(`   Preview User: ${testAccount.user}`);
  }

  return transporter;
};

/**
 * Send a verification email with a clickable link.
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, name, token) => {
  const transport = await getTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email/${token}`;

  const mailOptions = {
    from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
    to,
    subject: 'Verify Your Email - Dental CarePlus',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fd; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a237e, #42a5f5); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Dental Care<span style="color: #0D9488;">Plus</span></h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a237e; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for registering with Dental CarePlus. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(45deg, #1089d3, #12b1d1); color: white; padding: 14px 40px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="color: #888; font-size: 13px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #1089d3; word-break: break-all;">${verificationLink}</a>
          </p>
          <p style="color: #888; font-size: 13px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #e8eaf6; padding: 20px 30px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Dental CarePlus. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);

    // Log Ethereal preview URL for development
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Email Preview URL:', previewUrl);
      console.log('   Check this link to see the verification email in Test Mode.');
    } else {
      console.log(`✉️  Verification email sent to: ${to}`);
    }

    return info;
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error(`   To: ${to}`);
    console.error(`   Error: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('   Hint: Authentication failed. If using Gmail, make sure to use an App Password.');
    }
    throw error;
  }
};

module.exports = { sendVerificationEmail };
