
-- INSERT INTO users (name, email, password, role, email_verified) VALUES
-- ('Admin User', 'admin@dental.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'admin', TRUE),
-- ('Dr. Smith', 'smith@dental.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'doctor', TRUE),
-- ('John Doe', 'john@example.com', '$2b$10$9JnIvG7.R16B/pp.12gt9OhstdHjoNChMUERVzL2fegCmsHlMkkN6u', 'user', TRUE);


INSERT INTO services (name, description, price, duration_minutes) VALUES
('Oral Prophylaxis', 'Professional teeth cleaning and scaling to remove plaque and tartar.', 1500.00, 45),
('Tooth Extraction', 'Safe and painless removal of damaged or decayed teeth.', 1200.00, 30),
('Dental Filling (Pasta)', 'Restoration of decayed teeth using high-quality composite materials.', 1000.00, 45),
('Teeth Whitening', 'Professional bleaching treatment for a brighter and whiter smile.', 5000.00, 60),
('Dental Braces', 'Orthodontic treatment to correct misaligned teeth and bite issues.', 35000.00, 60),
('Root Canal Treatment', 'Specialized procedure to save a severely infected or damaged tooth.', 8000.00, 90),
('Dentures', 'Custom-made removable replacements for missing teeth and surrounding tissues.', 15000.00, 60),
('Dental Crowns', 'Protective caps placed over damaged teeth to restore shape and function.', 12000.00, 60),
('Dental Veneers', 'Thin shells of porcelain or composite resin bonded to the front of teeth.', 15000.00, 60),
('Check-up & Consultation', 'Comprehensive dental examination and professional advice.', 500.00, 30);


INSERT INTO schedules (dentist_id, day_of_week, start_time, end_time) VALUES
(2, 1, '09:00:00', '16:00:00'),
(2, 2, '09:00:00', '16:00:00'),
(2, 3, '09:00:00', '16:00:00'),
(2, 4, '09:00:00', '16:00:00'),
(2, 5, '09:00:00', '16:00:00');
