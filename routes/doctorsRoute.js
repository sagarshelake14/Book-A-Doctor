const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const moment = require("moment");

// ===============================
// AUTH & USERS
// ===============================
router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(200).send({ message: "User already exists", success: false });
    }
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(200).send({ message: "User created successfully", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error creating user", success: false, error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Password is incorrect", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).send({ message: "Login successful", success: true, data: token });
  } catch (error) {
    return res.status(500).send({ message: "Error logging in", success: false, error: error.message });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User does not exist", success: false });
    }
    user.password = undefined;
    return res.status(200).send({ message: "User information fetched successfully", success: true, data: user });
  } catch (error) {
    return res.status(500).send({ message: "Error getting user info", success: false, error: error.message });
  }
});

// ===============================
// DOCTOR PROFILE & ACTIONS
// ===============================
router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    const newDoctor = new Doctor({ ...req.body, userId, status: "pending" });
    await newDoctor.save();

    const adminUser = await User.findOne({ isAdmin: true });
    if (adminUser) {
      const unseenNotifications = adminUser.unseenNotifications || [];
      unseenNotifications.push({
        type: "new-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        },
        onClickPath: "/admin/doctorslist",
      });
      await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    }
    return res.status(200).send({ success: true, message: "Doctor account applied successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Error applying doctor account", success: false, error: error.message });
  }
});

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
    return res.status(200).send({ message: "Doctors fetched successfully", success: true, data: doctors });
  } catch (error) {
    return res.status(500).send({ message: "Error getting approved doctors", success: false, error: error.message });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    if (!doctor) {
      return res.status(200).send({ message: "Doctor not found", success: false });
    }
    return res.status(200).send({ message: "Doctor info fetched successfully", success: true, data: doctor });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching doctor info", success: false, error: error.message });
  }
});

router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const doctor = await Doctor.findOne({ userId });
    return res.status(200).send({ success: true, message: "Doctor info fetched successfully", data: doctor });
  } catch (error) {
    return res.status(500).send({ message: "Error getting doctor info", success: false, error: error.message });
  }
});

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const doctor = await Doctor.findOneAndUpdate({ userId }, req.body, { new: true });
    return res.status(200).send({ success: true, message: "Doctor profile updated successfully", data: doctor });
  } catch (error) {
    return res.status(500).send({ message: "Error updating doctor profile", success: false, error: error.message });
  }
});

// ===============================
// APPOINTMENTS
// ===============================
router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;

    const appointments = await Appointment.find({
      doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (appointments.length > 0) {
      return res.status(200).send({ message: "Appointments not available", success: false });
    }
    return res.status(200).send({ message: "Appointments available", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error checking booking availability", success: false, error: error.message });
  }
});

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    req.body.userId = req.user?.id || req.body.userId;
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();

    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    if (req.body.doctorInfo?.userId) {
      const user = await User.findById(req.body.doctorInfo.userId);
      if (user) {
        user.unseenNotifications = user.unseenNotifications || [];
        user.unseenNotifications.push({
          type: "new-appointment-request",
          message: `A new appointment request has been made by ${req.body.userInfo?.name}`,
          onClickPath: "/doctor/appointments",
        });
        await user.save();
      }
    }
    return res.status(200).send({ message: "Appointment booked successfully", success: true });
  } catch (error) {
    return res.status(500).send({ message: "Error booking appointment", success: false, error: error.message });
  }
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;
    const appointments = await Appointment.find({ userId });
    return res.status(200).send({ message: "Appointments fetched successfully", success: true, data: appointments });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching appointments", success: false, error: error.message });
  }
});

// GET appointments for logged-in doctor
router.get("/get-appointments-by-doctor-id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId || req.body?.userId;
    if (!userId) {
      return res.status(401).send({ message: "User ID not found in token", success: false });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(200).send({ message: "Doctor profile not found", success: false, data: [] });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id });
    return res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error: error.message,
    });
  }
});

// CHANGE appointment status (Approve / Reject)
router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });

    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found", success: false });
    }

    const user = await User.findById(appointment.userId);
    if (user) {
      user.unseenNotifications = user.unseenNotifications || [];
      user.unseenNotifications.push({
        type: "appointment-status-changed",
        message: `Your appointment status has been updated to ${status}`,
        onClickPath: "/appointments",
      });
      await user.save();
    }

    return res.status(200).send({
      message: "Appointment status updated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;