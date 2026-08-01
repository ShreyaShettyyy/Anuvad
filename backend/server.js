const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());


const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, 
  message: { error: 'Too many password reset attempts, please try again after 15 minutes' }
});



const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER || '15shreyashetty@gmail.com',
    pass: process.env.EMAIL_PASS || 'vrvl delv pozp pnqo'
  }
});


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Full name, email and password are required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)', [email, hashedPassword, fullName], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'User already exists.' });
        }
        return res.status(500).json({ error: 'Database error during registration.' });
      }
      res.json({ message: 'Registration successful', email });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/auth/login', (req, res) => {
  console.log('\n[LOGIN] Request received.');
  const { email, password } = req.body;
  console.log(`[LOGIN] Email received: ${email}`);

  if (!email || !password) {
    console.log('[LOGIN] Failure: Email and password are required');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('[LOGIN] Failure: Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      console.log(`[LOGIN] Failure: User NOT found in database for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    console.log(`[LOGIN] User found in database: ID=${user.id}, FullName=${user.full_name}`);
    
    const match = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN] Password hash comparison result: ${match}`);
    
    if (match) {
      console.log(`[LOGIN] Success: Login successful for ${email}`);
      res.json({ message: 'Login successful', email, fullName: user.full_name });
    } else {
      console.log(`[LOGIN] Failure: Incorrect password for ${email}`);
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  });
});


app.post('/api/auth/forgot-password', forgotPasswordLimiter, (req, res) => {
  console.log(`\n[FORGOT PASSWORD] Request received for password reset.`);
  const { email } = req.body;
  console.log(`[FORGOT PASSWORD] Email extracted from payload: ${email}`);

  if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error(`[FORGOT PASSWORD] Database error:`, err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      console.log(`[FORGOT PASSWORD] User NOT found in database for email: ${email}`);
      return res.status(404).json({ error: 'No account was found with this email address.' });
    }
    
    console.log(`[FORGOT PASSWORD] User found in database: ${user.full_name}`);

    const otp = generateOTP();
    console.log(`[FORGOT PASSWORD] OTP generated.`);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    db.run('INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresAt], (err) => {
      if (err) {
        console.error(`[FORGOT PASSWORD] Database error saving OTP:`, err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log(`[FORGOT PASSWORD] OTP saved to database successfully.`);

      const userFirstName = user.full_name ? user.full_name.split(' ')[0] : 'User';
      const senderEmail = process.env.EMAIL_USER || '15shreyashetty@gmail.com';

      const mailOptions = {
        from: `"SignBridge" <${senderEmail}>`,
        to: email,
        subject: 'SignBridge Password Reset OTP',
        text: `Hello, ${userFirstName},\n\nYou requested a password reset for your SignBridge account. Your 6-digit OTP is: ${otp}\n\nThis OTP will expire in 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nThe SignBridge Team`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #6a1b9a;">SignBridge Password Reset</h2>
            <p>Hello, <strong>${userFirstName}</strong>,</p>
            <p>We received a request to reset the password for your SignBridge account. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333; background: #f4f4f4; padding: 15px 30px; border-radius: 8px; border: 1px dashed #ccc;">${otp}</span>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px; color: #777;">Best regards,<br/><strong>The SignBridge Team</strong></p>
          </div>
        `
      };

      console.log(`[FORGOT PASSWORD] Email send started to ${email} via ${senderEmail}...`);

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`[FORGOT PASSWORD] Email send FAILED! Error:`, error);
          return res.status(500).json({ error: 'Unable to send OTP at the moment. Please try again later.' });
        }
        console.log(`[FORGOT PASSWORD] Email send SUCCEEDED! Message ID: ${info.messageId}`);
        console.log(`[FORGOT PASSWORD] SMTP Server Response: ${info.response}`);
        res.json({ message: 'OTP sent successfully. Please check your email.' });
      });
    });
  });
});


app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const now = Date.now();
  db.get('SELECT * FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1', [email], (err, record) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP.' });

    if (record.otp !== otp || record.expires_at < now) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    res.json({ message: 'OTP verified successfully.' });
  });
});


app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

  const now = Date.now();
  db.get('SELECT * FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1', [email], async (err, record) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!record || record.otp !== otp || record.expires_at < now) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        db.run('DELETE FROM password_resets WHERE id = ?', [record.id]);
        res.json({ message: 'Password updated successfully.' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
