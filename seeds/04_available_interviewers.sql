INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (1, 1, 1);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (2, 1, 2);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (3, 1, 4);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (4, 2, 2);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (5, 2, 3);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (6, 3, 3);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (7, 3, 4);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (8, 3, 5);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (9, 4, 3);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (10, 4, 5);
INSERT INTO available_interviewers (id, day_id, interviewer_id) VALUES (11, 5, 5);

ALTER SEQUENCE available_interviewers_id_seq RESTART WITH 12;