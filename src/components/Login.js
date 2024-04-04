import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const target = e.target;
    const name = target.name;

    setFormData((nextFormData) => ({ ...nextFormData, [name]: target.value }));
  };

  const login = async (formData) => {
    if (!validateInput(formData)) return;
    try {
      setLoading(true);
      const response = await axios.post(
        `${config.endpoint}/auth/login`,
        formData
      );

      setFormData({
        username: "",
        password: "",
      });
      setLoading(false);

      persistLogin(response.data.token,response.data.username, response.data.balance);

      enqueueSnackbar("Logged in successfully", { variant: "success" });
      history.push("/");
    } catch (e) {
      setLoading(true);
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
      setLoading(false);
    }
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }

    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form login-margin">
          <h2 className="title">Login</h2>

          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            fullWidth
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {!loading ? (
            <Button
              className="button"
              variant="contained"
              onClick={(e) => login(formData)}
            >
              LOGIN TO QKART
            </Button>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress color="success" size={25} disableShrink />
            </Box>
          )}
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
