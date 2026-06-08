-- Update existing doctor schedules to end at 16:00 (4 PM) instead of 17:00 (5 PM)
UPDATE schedules SET end_time = '16:00:00' WHERE end_time = '17:00:00';