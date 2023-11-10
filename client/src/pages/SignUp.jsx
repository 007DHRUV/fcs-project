import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha'; // Import the reCAPTCHA component

import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

    let username = String(formData.username);
    if (username === 'admin') {
      alert('This User name is not allowed ');

      return;
    }
    let password = String(formData.password);

    // Check if the password is at least 8 characters long
    if (password.length < 8) {
      alert('Password should be at least 8 characters long');
      return;
    }

    // Check if the password contains a mix of uppercase and lowercase letters
    if (!(/[a-z]/.test(password) && /[A-Z]/.test(password))) {
      alert('Password should contain a mix of uppercase and lowercase letters');
      return;
    }

    // Check if the password contains at least one digit
    if (!/\d/.test(password)) {
      alert('Password should contain at least one digit');
      return;
    }

    let adhar = String(formData.aadhaar);

    if (adhar.length < 12) {
      alert('Adhar should have length of 12 digits.');
      return;
    }

    // console.log(formData);

    if (!captchaVerified) {
      // If CAPTCHA is not verified, prevent form submission
      alert('Please complete the CAPTCHA verification.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, captchaVerified }), // Send CAPTCHA verification status to the server
      });
      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const onKeyPress = (button) => {
    if (activeInput && button !== '{enter}') {
      const inputId = activeInput;
      const newFormData = {
        ...formData,
        [inputId]: button,
      };
      setFormData(newFormData);
    }
  };

  useEffect(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('focus', handleInputFocus);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('focus', handleInputFocus);
      });
    };
  }, []);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          value={formData.username || ''}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email Address"
          className="border p-3 rounded-lg"
          id="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Aadhaar Number"
          className="border p-3 rounded-lg"
          id="aadhaar"
          value={formData.aadhaar || ''}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password || ''}
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
          {loading ? 'Loading....' : 'Sign Up'}
        </button>
      </form>

      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700">Sign In</span>
        </Link>
      </div>

      {error && <p className="text-red-500 mt-5">{error}</p>}

      <Keyboard
        keyboardRef={(r) => (keyboard.current = r)}
        layoutName="default"
        inputName={activeInput}
        onChange={onKeyPress}
      />
    </div>
  );
};

export default SignUp;
