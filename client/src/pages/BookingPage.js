import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, TimePicker, message } from "antd";
import moment from "moment";
import { useSelector } from "react-redux";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  const getDoctorData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvailability = async () => {
    try {
      if (!date || !time) return message.warning("Please select Date and Time");
      const res = await axios.post(
        "/api/v1/user/check-booking-availability",
        { doctorId: params.doctorId, date, time },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        setIsAvailable(true);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Error checking availability");
    }
  };

  const handleBooking = async () => {
    try {
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date,
          time,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        message.success(res.data.message);
      }
    } catch (error) {
      message.error("Error booking appointment");
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  return (
    <Layout>
      {doctor && (
        <div className="container m-2">
          <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
          <hr />
          <div className="row align-items-center">
            <div className="col-md-5 text-center">
              <img
                src="https://img.freepik.com/free-vector/book-now-banner_23-2148866162.jpg"
                alt="Book Now"
                style={{ width: "80%" }}
              />
            </div>
            <div className="col-md-7">
              <p><b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}</p>
              <p><b>Phone Number:</b> {doctor.phone}</p>
              <p><b>Address:</b> {doctor.address}</p>
              <p><b>Fee per Visit:</b> ₹{doctor.feePerCunsultation}</p>
              <p><b>Website:</b> {doctor.website}</p>
              
              <div className="d-flex flex-column w-50">
                <DatePicker
                  className="m-2"
                  format="DD-MM-YYYY"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setDate(moment(value).format("DD-MM-YYYY"));
                  }}
                />
                <TimePicker
                  className="m-2"
                  format="HH:mm"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(moment(value).format("HH:mm"));
                  }}
                />
                <button className="btn btn-primary m-2" onClick={handleAvailability}>
                  Check Availability
                </button>
                {isAvailable && (
                  <button className="btn btn-dark m-2" onClick={handleBooking}>
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BookingPage;