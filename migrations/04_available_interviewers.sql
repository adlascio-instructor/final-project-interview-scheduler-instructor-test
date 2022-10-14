CREATE TABLE available_interviewers (
    id SERIAL PRIMARY KEY,
    day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    interviewer_id INTEGER NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE
);