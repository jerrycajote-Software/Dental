const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jerrycajote90@gmail.com',
    pass: 'cqhs ckjd hlyk opka',
  },
});

async function run() {
  try {
    let info = await transporter.sendMail({
      from: '"Dental CarePlus" <noreply@dentalcareplus.com>',
      to: 'markjastin24@gmail.com',
      subject: 'Test Email Verification',
      text: 'This is a test email to check if SMTP is working correctly.',
    });
    console.log('Success:', info.messageId);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
