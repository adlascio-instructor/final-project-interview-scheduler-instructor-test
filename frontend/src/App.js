import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

import "./App.scss";

import DayList from "./components/DayList";
import Appointment from "./components/Appointment";

const socket = io.connect("http://localhost:8080");

export default function Application() {
  const [day, setDay] = useState("Monday");
  const [days, setDays] = useState({});
  const [appointments, setAppointments] = useState({});
  useEffect(() => {
    socket.on("cancel_interview", (appointment_id) => {
      cancelInterview(appointment_id);
    });

    socket.on("book_interview", (data) => {
      const { appointment_id, interview } = data;
      if (appointments[appointment_id]) {
        bookInterview(appointment_id, interview);
      }
    });

    return () => {
      socket.off("cancel_interview");
      socket.off("book_interview");
    };
  }, [day, appointments]);
  useEffect(() => {
    axios
      .get("/days")
      .then((res) => res.data)
      .then((days) => {
        setDays(days);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`/schedule/${day}`)
      .then((res) => res.data)
      .then((appointments) => setAppointments(appointments));
  }, [day]);
  function bookInterview(id, interview) {
    const isEdit = appointments[id].interview;
    setAppointments((prev) => {
      const appointment = {
        ...prev[id],
        interview: { ...interview },
      };
      const updatedAppointments = {
        ...prev,
        [id]: appointment,
      };
      return updatedAppointments;
    });
    if (!isEdit) {
      setDays((prev) => {
        const updatedDay = {
          ...prev[day],
          spots: prev[day].spots - 1,
        };
        const days = {
          ...prev,
          [day]: updatedDay,
        };
        return days;
      });
    }
  }
  function cancelInterview(id) {
    setAppointments((prev) => {
      const updatedAppointment = {
        ...prev[id],
        interview: null,
      };
      const updatedAppointments = {
        ...prev,
        [id]: updatedAppointment,
      };
      return updatedAppointments;
    });
    setDays((prev) => {
      const updatedDay = {
        ...prev[day],
        spots: prev[day].spots + 1,
      };
      const updatedDays = {
        ...prev,
        [day]: updatedDay,
      };
      return updatedDays;
    });
  }
  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList days={days} value={day} onChange={setDay} />
        </nav>
      </section>
      <section className="schedule">
        {Object.values(appointments).map((appointment) => (
          <Appointment
            key={appointment.id}
            {...appointment}
            bookInterview={(interview) => {
              socket.emit("book_interview", {
                appointment_id: appointment.id,
                interview,
              });
              // bookInterview(appointment.id, interview);
            }}
            cancelInterview={cancelInterview}
            socket={socket}
          />
        ))}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}
