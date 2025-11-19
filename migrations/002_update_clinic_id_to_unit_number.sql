ALTER TABLE patients RENAME COLUMN clinic_id TO unit_number;
ALTER TABLE outpatient_visits RENAME COLUMN clinic_id TO unit_number;