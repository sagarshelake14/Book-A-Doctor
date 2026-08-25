import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function Doctor({ doctor }) {
  const navigate = useNavigate();

  // Helper function to safely format timings
  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    // Check if already in HH:mm format
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    // Parse valid moment date/time
    const parsed = moment(timeStr);
    return parsed.isValid() ? parsed.format("HH:mm") : timeStr;
  };

  const startTime = doctor?.timings?.[0] ? formatTime(doctor.timings[0]) : "00:00";
  const endTime = doctor?.timings?.[1] ? formatTime(doctor.timings[1]) : "00:00";

  return (
    <div
      className="card p-2 cursor-pointer"
      onClick={() => navigate(`/book-appointment/${doctor._id}`)}
    >
      <h1 className="card-title">
        {doctor.firstName} {doctor.lastName}
      </h1>
      <hr />
      <p>
        <b>Phone Number : </b>
        {doctor.phoneNumber}
      </p>
      <p>
        <b>Address : </b>
        {doctor.address}
      </p>
      <p>
        <b>Fee per Visit : </b>
        {doctor.feePerCunsultation || doctor.feePerConsultation}
      </p>
      <p>
        <b>Timings : </b>
        {startTime} - {endTime}
      </p>
    </div>
  );
}

export default Doctor;