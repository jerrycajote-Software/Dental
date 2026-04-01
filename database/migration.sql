
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

UPDATE users SET role = 'user' WHERE role = 'client';
UPDATE users SET role = 'doctor' WHERE role = 'dentist';

UPDATE users SET email_verified = TRUE WHERE role = 'admin';

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
