-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client', -- 'admin', 'dentist', 'staff', 'client'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER DEFAULT 30
);

-- Create Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    dentist_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Schedules table (for dentists)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    dentist_id INTEGER REFERENCES users(id),
    day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);
