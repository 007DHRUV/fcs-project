import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import ReCAPTCHA from "react-google-recaptcha"; // Import the reCAPTCHA component


const Admin = () => {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeInput, setActiveInput] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false); // New state for CAPTCHA verification
  const keyboard = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleInputFocus = (e) => {
    setActiveInput(e.target.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      // If CAPTCHA is not verified, prevent form submission
      alert("Please complete the CAPTCHA verification.");
      return;
    }

    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, captchaVerified }), // Send CAPTCHA verification status to the server
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate("/admincontroller");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const onKeyPress = (button) => {
    if (activeInput && button !== "{enter}") {
      const inputId = activeInput;
      const newFormData = {
        ...formData,
        [inputId]: button,
      };
      setFormData(newFormData);
    }
  };

  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", handleInputFocus);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleInputFocus);
      });
    };
  }, []);


  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In as admin</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="user"
          placeholder="user name"
          className="border p-3 rounded-lg"
          id="user"
          value={formData.user || ""}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password || ""}
          onChange={handleChange}
        />
        <ReCAPTCHA // Add reCAPTCHA component
          sitekey="6LfUhAgpAAAAAIJYT11KMdlHVDofpUqC9Ne02-7j"
          onChange={() => setCaptchaVerified(true)}
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading...." : "Sign In"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-5">{error}</p>}

      <Keyboard
        keyboardRef={(r) => (keyboard.current = r)}
        layoutName={"default"}
        inputName={activeInput}
        onChange={onKeyPress}
      />
    </div>
  );
};

export default Admin;
