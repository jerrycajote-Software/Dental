
AlTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
alter table users add column if not exists last_name varchar(255);
alter table users add column if not exists middle_name varchar(255);
alter table users add column if not exists age integer;
alter table users add column if not exists date_of_birth date;
alter table users add column if not exists contact_number varchar(255);
alter table users add column if not exists home_address text;
alter table users add column if not exists allergies text;
alter table users add column if not exists previous_dental_history text;