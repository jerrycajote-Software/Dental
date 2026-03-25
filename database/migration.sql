-- Migration: Add email verification columns and standardize roles
-- Run this against your existing database to apply changes

-- Step 1: Add new columns for email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Step 2: Rename role values (client → user, dentist → doctor)
UPDATE users SET role = 'user' WHERE role = 'client';
UPDATE users SET role = 'doctor' WHERE role = 'dentist';

-- Step 3: Mark admin account as email-verified
UPDATE users SET email_verified = TRUE WHERE role = 'admin';

-- Step 4: Update default role value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
