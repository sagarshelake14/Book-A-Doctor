import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import moment from "moment";

import Layout from "../components/Layout";
import DoctorForm from "../components/DoctorForm";
import { showLoading, hideLoading } from "../redux/alertsSlice";

function ApplyDoctor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const onFinish = async (values) => {
    try {
      dispatch(showLoading());

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      if (
        !values.timings ||
        values.timings.length !== 2 ||
        !values.timings[0] ||
        !values.timings[1]
      ) {
        toast.error("Please select working timings");
        return;
      }

      const formattedTimings = [
        moment(values.timings[0], ["HH:mm", moment.ISO_8601]).format("HH:mm"),
        moment(values.timings[1], ["HH:mm", moment.ISO_8601]).format("HH:mm"),
      ];

      const requestData = {
        ...values,
        userId: user?._id,
        feePerCunsultation: Number(values.feePerCunsultation),
        timings: formattedTimings,
      };

      const response = await axios.post(
        "/api/user/apply-doctor-account",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Doctor account applied successfully");
        navigate("/");
      } else {
        toast.error(response.data.message || "Failed to apply for doctor account");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying for doctor account");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Apply Doctor</h1>
      <hr />
      <DoctorForm onFinish={onFinish} />
    </Layout>
  );
}

export default ApplyDoctor;