const http = require("http");
const express = require("express");
const { Pool } = require("pg");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
  methods: ["GET", "POST"],
});
const port = 8080;

const dbCredentials = {
  name: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};
io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("cancel_interview", (appointment_id) => {
    const pool = new Pool(dbCredentials);
    pool
      .query("DELETE FROM interviews WHERE appointment_id = $1 RETURNING *", [
        appointment_id,
      ])
      .then((result) => result.rows[0])
      .then((canceledInterview) => {
        io.emit("cancel_interview", appointment_id);
      })
      .catch((err) => console.log("err", err));
  });

  socket.on("book_interview", (data) => {
    const { appointment_id, interview } = data;
    const { student, interviewer } = interview;
    const interviewer_id = interviewer.id;
    const pool = new Pool(dbCredentials);
    pool
      .query(
        "INSERT INTO interviews (student, interviewer_id, appointment_id) VALUES ($1, $2, $3)  RETURNING *",
        [student, interviewer_id, appointment_id]
      )
      .then((result) => result.rows[0])
      .then((bookedInterview) => {
        const { appointment_id } = bookedInterview;
        const resultJSON = {
          appointment_id,
          interview,
        };
        io.emit("book_interview", resultJSON);
      })
      .catch((err) => console.log("err", err));
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

app.get("/schedule/:id", (req, res) => {
  const pool = new Pool(dbCredentials);

  pool
    .query(
      `SELECT appointments.id, appointments.time, interviews.student, interviewers.id AS interviewer_id, interviewers.name, interviewers.avatar  FROM appointments
    LEFT JOIN interviews ON appointments.id = interviews.appointment_id
    LEFT JOIN interviewers ON interviews.interviewer_id = interviewers.id
    WHERE day_id IN(SELECT id FROM days WHERE name = $1)
    ORDER BY appointments.id;`,
      [req.params.id]
    )
    .then((result) => result.rows)
    .then((schedule) => {
      const resultJSON = {};
      schedule.forEach((appointment) => {
        const {
          id,
          time,
          interview_id,
          student,
          interviewer_id,
          name,
          avatar,
        } = appointment;
        resultJSON[id] = {
          id,
          time,
        };
        if (interviewer_id) {
          resultJSON[id].interview = {
            student,
            interviewer: {
              id: interviewer_id,
              name,
              avatar,
            },
          };
        }
      });
      res.json(resultJSON);
    })
    .catch((err) => console.log("err", err))
    .finally(() => pool.end());
});

app.get("/days", (req, res) => {
  const pool = new Pool(dbCredentials);
  pool
    .query(
      `SELECT days.*, COUNT(appointments.*) AS appointments, COUNT(interviews.*) AS interviews FROM days
    JOIN appointments ON days.id = appointments.day_id
    LEFT JOIN interviews ON appointments.id = interviews.appointment_id
    GROUP BY days.id
    ORDER BY days.id;`
    )
    .then((result) => result.rows)
    .then((days) => {
      const resultJSON = {};
      days.forEach((day) => {
        const { id, name, appointments, interviews } = day;
        resultJSON[name] = {
          id,
          name,
          spots: Number(appointments) - Number(interviews),
        };
      });
      res.json(resultJSON);
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
