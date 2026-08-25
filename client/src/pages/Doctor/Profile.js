import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Row, Col, Input, TimePicker, message, Button } from "antd";
import axios from "axios";
import moment from "moment";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertsSlice";

const Profile = () => {
  const [doctor, setDoctor] = useState(null);
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/doctor/get-doctor-info-by-user-id",
        { userId: params.userId || params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        const docData = res.data.data;
        setDoctor(docData);

        // Check if timings exist and are valid non-zero values
        let parsedTimings = undefined;
        if (
          docData?.timings &&
          docData.timings.length === 2 &&
          docData.timings[0] !== "00:00" &&
          docData.timings[0] !== "Invalid date"
        ) {
          const t1 = moment(docData.timings[0], "HH:mm");
          const t2 = moment(docData.timings[1], "HH:mm");
          if (t1.isValid() && t2.isValid()) {
            parsedTimings = [t1, t2];
          }
        }

        // Programmatically set form values to prevent auto-scroll loops
        form.setFieldsValue({
          ...docData,
          timings: parsedTimings,
        });
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error("Failed to fetch doctor details");
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  const handleFinish = async (values) => {
    try {
      if (!values.timings || values.timings.length !== 2 || !values.timings[0] || !values.timings[1]) {
        return message.error("Please select valid start and end timings");
      }

      dispatch(showLoading());

      // FIX: Check if it's already a string, otherwise use native .format() directly
      const startStr = typeof values.timings[0] === "string" 
        ? values.timings[0] 
        : values.timings[0].format("HH:mm");
        
      const endStr = typeof values.timings[1] === "string" 
        ? values.timings[1] 
        : values.timings[1].format("HH:mm");

      const res = await axios.post(
        "/api/doctor/update-doctor-profile",
        {
          ...values,
          userId: doctor.userId,
          feePerCunsultation: Number(values.feePerCunsultation),
          timings: [startStr, endStr], // Sends clean "HH:mm" strings
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Profile updated successfully");
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error("Failed to update profile");
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Doctor Profile</h1>
      <hr />
      {doctor && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <h4 className="card-title mt-3">Personal Information</h4>
          <Row gutter={20}>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[{ required: true, message: "Phone number is required" }]}
              >
                <Input placeholder="Phone Number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Website"
                name="website"
                rules={[{ required: true, message: "Website is required" }]}
              >
                <Input placeholder="Website" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input placeholder="Address" />
              </Form.Item>
            </Col>
          </Row>

          <hr />
          <h4 className="card-title mt-3">Professional Information</h4>
          <Row gutter={20}>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[{ required: true, message: "Specialization is required" }]}
              >
                <Input placeholder="Specialization" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Experience"
                name="experience"
                rules={[{ required: true, message: "Experience is required" }]}
              >
                <Input placeholder="Experience" type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Fee Per Consultation"
                name="feePerCunsultation"
                rules={[{ required: true, message: "Fee is required" }]}
              >
                <Input placeholder="Fee Per Consultation" type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item
                label="Timings"
                name="timings"
                rules={[{ required: true, message: "Timings are required" }]}
              >
                <TimePicker.RangePicker 
                  format="HH:mm" 
                  minuteStep={5}
                  popupClassName="timing-range-picker"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button className="primary-button" htmlType="submit">
              SUBMIT
            </Button>
          </div>
        </Form>
      )}
    </Layout>
  );
};

export default Profile;