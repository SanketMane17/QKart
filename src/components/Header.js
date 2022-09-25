import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const logout = (e) => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title" onClick={() => history.push("/")}>
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>

      <Box>
        <Stack direction="row" spacing={2}>
          {localStorage.getItem("token") !== null ? (
            <Box className="login-user">
              <Box className="child">{children}</Box>
              <Box display="flex" alignItems="center" className="child">
                <Avatar
                  alt={localStorage.getItem("username")}
                  src="avatar.png"
                  sx={{ width: 34, height: 34 }}
                />
                <p className="username-text">
                  {localStorage.getItem("username")}
                </p>
              </Box>
              <Box className="child">
                <Button onClick={logout} className="logout">
                  LOGOUT
                </Button>
              </Box>
            </Box>
          ) : hasHiddenAuthButtons ? (
            <Button
              className="explore-button"
              startIcon={<ArrowBackIcon />}
              variant="text"
              onClick={() => history.push("/")}
            >
              Back to explore
            </Button>
          ) : (
            <>
              <Box>{children}</Box>
              <Button onClick={() => history.push("/login")}>LOGIN</Button>
              <Button
                variant="contained"
                className="register"
                onClick={() => history.push("/register")}
              >
                REGISTER
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;
