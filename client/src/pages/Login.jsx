import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "./components/axios.js";
import { UserContext } from "./components/context/userContext";
import { scheduleRefresh } from "./components/utils/tokenScheduler";
import { LuUserRoundCheck } from "react-icons/lu";

const Login = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const { state } = useLocation();

  const location = useLocation();
  const isExpired =
    new URLSearchParams(location.search).get("error") === "expired";

  const changeInputHandler = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/users/login", userData);
      setCurrentUser(response.data);
      scheduleRefresh();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div className="container">
        <h2>Sign In</h2>
        {state?.email && (
          <p className="form__success-message">
            <LuUserRoundCheck style={{ fontWeight: "bolder" }} />
            {state?.email} has been successfully
            registered.
          </p>
        )}
        <form className="form login__form" onSubmit={loginUser}>
          {isExpired && (
            <p className="form__error-message">
              Session expired. Please log in again.
            </p>
          )}
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={userData.email}
            onChange={changeInputHandler}
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={userData.password}
            onChange={changeInputHandler}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn primary"
            disabled={loading}
            style={{
              opacity: loading ? 0.75 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
        <small>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </small>
        <small>
          <Link to="/forgotPassword">Forgot Password?</Link>
        </small>
      </div>
    </section>
  );
};

export default Login;
