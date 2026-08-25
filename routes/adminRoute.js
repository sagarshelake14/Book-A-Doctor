const express = require("express");
const router = express.Router();

const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

// ===============================
// GET ALL DOCTORS
// ===============================
router.get(
  "/get-all-doctors",
  authMiddleware,
  async (req, res) => {
    try {
      const doctors = await Doctor.find({});

      return res.status(200).send({
        message: "Doctors fetched successfully",
        success: true,
        data: doctors,
      });
    } catch (error) {
      console.log("GET ALL DOCTORS ERROR:", error);

      return res.status(500).send({
        message: "Error getting doctors",
        success: false,
        error: error.message,
      });
    }
  }
);

// ===============================
// GET ALL USERS
// ===============================
router.get(
  "/get-all-users",
  authMiddleware,
  async (req, res) => {
    try {
      const users = await User.find({});

      return res.status(200).send({
        message: "Users fetched successfully",
        success: true,
        data: users,
      });
    } catch (error) {
      console.log("GET ALL USERS ERROR:", error);

      return res.status(500).send({
        message: "Error getting users",
        success: false,
        error: error.message,
      });
    }
  }
);

// ===============================
// CHANGE DOCTOR ACCOUNT STATUS
// ===============================
router.post(
  "/change-doctor-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { doctorId, status } = req.body;

      if (!doctorId || !status) {
        return res.status(400).send({
          message: "Doctor ID and status are required",
          success: false,
        });
      }

      const doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { status },
        { new: true }
      );

      if (!doctor) {
        return res.status(404).send({
          message: "Doctor not found",
          success: false,
        });
      }

      const user = await User.findOne({
        _id: doctor.userId,
      });

      if (user) {
        user.unseenNotifications =
          user.unseenNotifications || [];

        user.unseenNotifications.push({
          type: "new-doctor-request-changed",
          message: `Your doctor account has been ${status}`,
          onClickPath: "/notifications",
        });

        user.isDoctor = status === "approved";

        await user.save();
      }

      return res.status(200).send({
        message: "Doctor status updated successfully",
        success: true,
        data: doctor,
      });
    } catch (error) {
      console.log("CHANGE DOCTOR STATUS ERROR:", error);

      return res.status(500).send({
        message: "Error changing doctor account status",
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;