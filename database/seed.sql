-- Seed Users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@dental.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'admin'),
('Dr. Smith', 'smith@dental.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'dentist'),
('John Doe', 'john@example.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'client');


-- Seed Services
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Cleaning', 'Professional teeth cleaning', 150.00, 45),
('Whitening', 'Teeth whitening treatment', 250.00, 60),
('Filling', 'Dental cavity filling', 200.00, 45),
('Checkup', 'Routine dental checkup', 100.00, 30);

-- Seed Schedules for Dr. Smith (Mon-Fri 9-5)
INSERT INTO schedules (dentist_id, day_of_week, start_time, end_time) VALUES
(2, 1, '09:00:00', '17:00:00'),
(2, 2, '09:00:00', '17:00:00'),
(2, 3, '09:00:00', '17:00:00'),
(2, 4, '09:00:00', '17:00:00'),
(2, 5, '09:00:00', '17:00:00');
