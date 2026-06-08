const nodemailer = require('nodemailer');


let transporter = null;
let isInitializing = false;

/**
 * Initialize the email transporter.
 * Uses Ethereal (fake SMTP) for development/testing.
 * To switch to Gmail, update the .env with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 */
const getTransporter = async () => {
  if (transporter) return transporter;
  if (isInitializing) {
    // Wait for existing initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (transporter) return transporter;
    }
  }

  isInitializing = true;
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials are not fully configured in the environment variables. Production email requires SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    }
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
    });
    console.log('✅ Email configured with custom SMTP');
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    throw error;
  } finally {
    isInitializing = false;
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


const sendWalkinVerificationEmail = async (to, name, token, tempPassword) => {
  const transport = await getTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email/${token}`;
  const loginLink = `${clientUrl}/login`;

  const mailOptions = {
    from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
    to,
    subject: '🦷 Your Dental CarePlus Account — Credentials & Verification',
    html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#f0f6ff;border-radius:20px;overflow:hidden;border:1px solid #d0e4f7;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1089d3,#0d73b0);padding:36px 30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">
            Dental Care<span style="color:#0ff0c0;">Plus</span>
          </h1>
          <p style="color:#c8e8ff;margin:8px 0 0;font-size:14px;">Clinic Patient Portal</p>
        </div>

        <!-- Body -->
        <div style="padding:36px 30px;background:#fff;">
          <h2 style="color:#0d4f80;margin-top:0;font-size:22px;">Welcome, ${name}! 👋</h2>
          <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Your patient account has been created by our clinic staff.
            Below are your login credentials. Please keep them safe.
          </p>

          <!-- Credentials box -->
          <div style="background:#e8f4fd;border:2px solid #1089d3;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
            <p style="color:#1089d3;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">
              🔐 Your Login Credentials
            </p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#555;font-size:14px;padding:6px 0;width:130px;font-weight:600;">Email:</td>
                <td style="color:#0d4f80;font-size:14px;font-weight:700;">${to}</td>
              </tr>
              <tr>
                <td style="color:#555;font-size:14px;padding:6px 0;font-weight:600;">Temp Password:</td>
                <td>
                  <span style="background:#fff;border:1px solid #1089d3;border-radius:8px;padding:5px 14px;font-size:15px;font-weight:700;color:#0d4f80;letter-spacing:1.5px;font-family:monospace;">
                    ${tempPassword}
                  </span>
                </td>
              </tr>
            </table>
            <p style="color:#888;font-size:12px;margin:14px 0 0;line-height:1.5;">
              <strong>Password format:</strong> First 2 letters of your first name + first 2 letters of your last name + your birth year.<br>
              Example: <em>Cedric Torres, born 2003</em> → <strong>CeTo2003</strong>
            </p>
          </div>

          <!-- Steps -->
          <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 12px;">📋 How to access your account:</p>
          <ol style="color:#444;font-size:14px;line-height:2;padding-left:20px;margin:0 0 28px;">
            <li>Click the <strong>"Verify My Email"</strong> button below.</li>
            <li>You will be redirected to a confirmation page.</li>
            <li>Return to the <a href="${loginLink}" style="color:#1089d3;">login page</a> and login using the credentials above.</li>
            <li>Change your password immediately after your first login.</li>
          </ol>

          <!-- CTA Button -->
          <div style="text-align:center;margin:28px 0;">
            <a href="${verificationLink}"
               style="background:linear-gradient(135deg,#1089d3,#0d73b0);color:#fff;padding:16px 48px;border-radius:30px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;box-shadow:0 4px 15px rgba(16,137,211,0.35);letter-spacing:0.3px;">
              ✅ Verify My Email
            </a>
          </div>

          <!-- Warning -->
          <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 18px;margin-top:4px;">
            <p style="color:#92400e;font-size:13px;margin:0;line-height:1.6;">
              <strong>💡 Note:</strong> You can now log in immediately using the credentials above, but we still recommend verifying your email for account security.
            </p>
          </div>

          <!-- Fallback link -->
          <p style="color:#999;font-size:12px;margin-top:22px;line-height:1.6;">
            If the button doesn't work, paste this link into your browser:<br>
            <a href="${verificationLink}" style="color:#1089d3;word-break:break-all;">${verificationLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#e8f0f7;padding:18px 30px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} Dental CarePlus. All rights reserved.</p>
        </div>

      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Walk-in email preview:', previewUrl);
    } else {
      console.log(`✉️  Walk-in credentials email sent to: ${to}`);
    }
    return info;
  } catch (error) {
    console.error('❌ Error sending walk-in verification email:', error.message);
    throw error;
  }
};

/**
 * Send a password reset email.
 */
const sendPasswordResetEmail = async (to, resetLink) => {
  const transport = await getTransporter();

  const mailOptions = {
    from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
    to,
    subject: 'Reset Your Password - Dental CarePlus',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fd; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a237e, #42a5f5); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Dental Care<span style="color: #0D9488;">Plus</span></h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a237e; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Please click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(45deg, #1089d3, #12b1d1); color: white; padding: 14px 40px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <p style="color: #888; font-size: 13px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #1089d3; word-break: break-all;">${resetLink}</a>
          </p>
          
          <p style="color: #888; font-size: 13px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>

        <div style="background: #e8eaf6; padding: 20px 30px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Dental CarePlus. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`✉️  Password reset email sent to: ${to}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw error;
  }
};

/**
 * Send an appointment notification to a doctor.
 */
const sendDoctorAppointmentNotification = async (doctorEmail, doctorName, appointmentDetails) => {
  const transport = await getTransporter();
  const { patientName, date, time, services, notes } = appointmentDetails;

  const mailOptions = {
    from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
    to: doctorEmail,
    subject: `🦷 New Appointment Booked - ${patientName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f0f7ff; border-radius: 16px; overflow: hidden; border: 1px solid #e1e8f0;">
        <div style="background: linear-gradient(135deg, #0d4f80, #1089d3); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Appointment</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0d4f80; margin-top: 0;">Hello, Dr. ${doctorName}</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            A new appointment has been booked with you. Here are the details:
          </p>

          <div style="background: #f8fbff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e1eefc;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Patient:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Time:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Service(s):</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${services}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Notes:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-style: italic;">"${notes}"</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Please log in to your dashboard to manage your appointments.
          </p>
        </div>

        <div style="background: #f1f5f9; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Dental CarePlus. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`✉️  Appointment notification sent to Dr. ${doctorName} (${doctorEmail})`);
  } catch (error) {
    console.error(`❌ Error sending doctor appointment notification: ${error.message}`);
    // Don't throw here to prevent appointment booking from failing if email fails
  }
};

/**
 * Send an appointment notification to a patient.
 */
const sendPatientAppointmentNotification = async (patientEmail, patientName, appointmentDetails) => {
  const transport = await getTransporter();
  const { doctorName, date, time, services, notes } = appointmentDetails;

  const mailOptions = {
    from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
    to: patientEmail,
    subject: `🦷 Appointment Confirmed - Dental CarePlus`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f0f7ff; border-radius: 16px; overflow: hidden; border: 1px solid #e1e8f0;">
        <div style="background: linear-gradient(135deg, #1089d3, #0d4f80); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Confirmed</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0d4f80; margin-top: 0;">Hello, ${patientName}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your dental appointment has been successfully booked. Here are your details:
          </p>

          <div style="background: #f8fbff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e1eefc;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Doctor:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">Dr. ${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Time:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Service(s):</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${services}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Notes:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-style: italic;">"${notes}"</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact the clinic or use your patient dashboard.
          </p>
        </div>

        <div style="background: #f1f5f9; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Dental CarePlus. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`✉️  Appointment confirmation sent to Patient ${patientName} (${patientEmail})`);
  } catch (error) {
    console.error(`❌ Error sending patient appointment confirmation: ${error.message}`);
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWalkinVerificationEmail,
  sendPasswordResetEmail,
  sendDoctorAppointmentNotification,
  sendPatientAppointmentNotification
};
