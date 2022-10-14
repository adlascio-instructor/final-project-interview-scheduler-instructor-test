CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    student VARCHAR(100) NOT NULL,
    interviewer_id INTEGER NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE
);