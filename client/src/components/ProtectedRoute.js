import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { setUser } from "../redux/userSlice";
import { showLoading, hideLoading } from "../redux/alertsSlice";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");

      // No token
      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      dispatch(showLoading());

      const response = await axios.post(
        "/api/user/get-user-info-by-id",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        dispatch(setUser(response.data.data));
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      dispatch(hideLoading());

      console.log(
        "GET USER ERROR:",
        error.response?.data || error.message
      );

      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Wait until authentication check is completed
  if (loading) {
    return <div>Loading...</div>;
  }

  // No token
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  // Token exists and user is authenticated
  return children;
}

export default ProtectedRoute;