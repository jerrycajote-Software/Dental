To auto-approve user verification directly in your PostgreSQL database, you can run an UPDATE command on the users table.

Based on your codebase (server/controllers/authController.js), the system tracks verification using the email_verified column.

1. Verify a Specific User
If you want to verify a single user by their email address:

sql
UPDATE users 
SET email_verified = TRUE, 
    verification_token = NULL, 
    verification_token_expires = NULL 
WHERE email = 'user@example.com';
2. Verify All Unverified Users
To approve everyone who is currently pending verification:

sql
UPDATE users 
SET email_verified = TRUE, 
    verification_token = NULL, 
    verification_token_expires = NULL 
WHERE email_verified = FALSE;
How to run these commands:
Using psql (Terminal): If you have access to the terminal where Postgres is running, you can connect and run the query:

bash
psql -d your_database_name -c "UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE email = 'target@email.com';"

Using a GUI (like pgAdmin or DBeaver): Open a Query Tool window, paste the SQL above, and click Execute.

Using your DATABASE_URL: If you are using a hosted database (like Supabase or Neon), you can run these in their built-in SQL editors.

TIP

Clearing the verification_token and verification_token_expires (by setting them to NULL) is recommended to ensure the user's state is consistent with a successful manual verification.