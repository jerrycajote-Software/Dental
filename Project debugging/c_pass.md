Because passwords in your system are encrypted using bcrypt, you cannot simply type a plain-text password directly into the database (the system wouldn't be able to log them in because the hashes won't match).

To change a user's password directly through the database, you need to first hash the new password using bcrypt, and then run an UPDATE SQL query.

The easiest way to do this is to quickly create a utility Node.js script in your project folder.

Here is exactly how you can do it:

Step 1: Create a utility script
Create a file named update_password.js in the root of your project (C:\Users\Jerry Cajote\Documents\Vcode\Dental\update_password.js) and paste the following code into it:

javascript
const bcrypt = require('bcryptjs');
const db = require('./server/config/db'); // Your database connection pool
async function updateUserPassword(email, newPassword) {
  try {
    // 1. Hash the new password 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // 2. Update the user account in the database
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, name',
      [hashedPassword, email.trim().toLowerCase()]
    );
    if (result.rowCount === 0) {
      console.log('❌ User not found with that email.');
    } else {
      console.log(`✅ Password successfully updated for: ${result.rows[0].name} (${result.rows[0].email})`);
    }
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    process.exit(0);
  }
}
// REPLACE WITH THE TARGET EMAIL AND DESIRED NEW PASSWORD
const TARGET_EMAIL = 'patient@example.com';
const NEW_PASSWORD = 'MyNewPassword123!';
updateUserPassword(TARGET_EMAIL, NEW_PASSWORD);
Step 2: Run the script
Open your terminal and run the script using Node:

powershell
node update_password.js
Step 3: Clean up
Once the script says ✅ Password successfully updated, the user will immediately be able to log in with the new password. For security reasons, you should delete the update_password.js file after you use it so you don't accidentally check in passwords to your code repository.

Let me know if you would like me to create and run this script for a specific user account!

what if inside PostgreSQL  is that passible? if can, what's syntax to change the password of the user?
Yes, it is definitely possible directly inside PostgreSQL!

However, because your system uses bcrypt encryption, standard text won't work. PostgreSQL needs to hash the password properly. You have two ways to do this directly in SQL:

Method 1: Using PostgreSQL's pgcrypto extension (Recommended & Quick)
If your database has the pgcrypto extension enabled, PostgreSQL can generate the bcrypt hash itself. You can run these commands directly in your SQL tool (like pgAdmin or psql):

sql
-- 1. Enable the extension (you only ever have to run this once)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 2. Update the password using the crypt() function
UPDATE users 
SET password = crypt('MyNewPassword123!', gen_salt('bf', 10))
WHERE email = 'patient@example.com';
(Note: bf tells it to use bcrypt, and 10 is the salt rounds which matches your Node.js backend).

Method 2: Manually inserting a pre-generated hash (If pgcrypto is not available)
If you cannot install the pgcrypto extension, pure SQL cannot generate a bcrypt hash. In this case, you would:

Generate a bcrypt hash for your new password using an online tool (like Bcrypt Generator) or a quick code snippet. Example: Hashing MyNewPassword123! might give you $2a$10$w...
Simply copy that resulting hash and run a standard SQL update:
sql
UPDATE users 
SET password = '$2a$10$wVb/r2Z8j4/zXz5qO3j... (paste your full hash here)'
WHERE email = 'patient@example.com';