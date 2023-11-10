import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaShare,
  FaUser,
  FaCamera,
  FaPencilAlt,
  FaTrash,
  FaSignOutAlt,
} from 'react-icons/fa';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
  const [activeInput, setActiveInput] = useState(null);
  const keyboard = useRef(null);

  const onKeyPress = (button) => {
    if (activeInput && button !== '{enter}') {
      const inputId = activeInput;

      // Handle space and backspace separately
      if (button === '{space}') {
        button = ' '; // Replace '{space}' with a normal space
      } else if (button === '{bksp}') {
        const existingValue = formData[inputId] || '';
        const newValue = existingValue.slice(0, -1); // Remove the last character for backspace
        const newFormData = {
          ...formData,
          [inputId]: newValue,
        };
        setFormData(newFormData);

        // Manually set focus on the input field after pressing backspace
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
          inputElement.value = newFormData[inputId];
          inputElement.focus();
        }
        return; // Stop further processing for backspace
      }

      const existingValue = formData[inputId] || '';
      const newFormData = {
        ...formData,
        [inputId]: existingValue + button,
      };
      setFormData(newFormData);

      // Manually set focus on the input field after pressing a key on the keyboard
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.value = newFormData[inputId];
        inputElement.focus();
      }
    }
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="avatar" className="self-center cursor-pointer">
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            id="avatar"
            ref={fileRef}
            hidden
            accept="image/*"
          />
          <img
            onClick={() => fileRef.current.click()}
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2 border border-blue-500"
            src={formData.avatar || currentUser.avatar}
            alt="Profile"
          />
          <FaCamera className="text-blue-500 absolute bottom-0 right-0 cursor-pointer bg-white rounded-full p-2" />
        </label>
        <p className="text-sm text-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Uploading Image (must be less than 2 MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-blue-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image Successfully Uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <label htmlFor="username">Your Name</label>
        <input
          id="username"
          type="text"
          defaultValue={currentUser.username}
          placeholder="Username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          // value={formData.username}
          onFocus={() => setActiveInput('username')}
        />
        <label htmlFor="email">Your Email </label>

        <input
          id="email"
          type="email"
          defaultValue={currentUser.email}
          placeholder="Email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          onFocus={() => setActiveInput('email')}
        />
        <label htmlFor="aadhaar">Your Aadhaar</label>

        <input
          id="aadhaar"
          type="number"
          defaultValue={currentUser.aadhaar}
          placeholder="Aadhaar Number"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          onFocus={() => setActiveInput('aadhaar')}
        />
        <label htmlFor="password">Your Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          onFocus={() => setActiveInput('password')}
        />
        <button
          disabled={loading}
          className="bg-blue-700 text-white rounded-lg p-4 uppercase hover:bg-blue-600 disabled:opacity-80"
          type="submit"
        >
          {loading ? 'Loading...' : 'Update'}
        </button>

   <Keyboard
          keyboardRef={(r) => (keyboard.current = r)}
          layoutName="default"
          inputName={activeInput}
          onKeyPress={onKeyPress}
        />
        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-4 rounded-lg uppercase text-center hover:bg-green-600"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <button
          onClick={handleDeleteUser}
          className="bg-red-700 text-white p-4 rounded-lg uppercase text-center hover:bg-red-600"
        >
          <FaTrash className="text-lg mr-2" />
          Delete Account
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-700 text-white p-4 rounded-lg uppercase text-center hover:bg-red-600"
        >
          <FaSignOutAlt className="text-lg mr-2" />
          Sign Out
        </button>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ''}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      <button
        onClick={handleShowListings}
        className="bg-blue-700 text-white rounded-lg p-4 uppercase hover:bg-blue-600 disabled:opacity-80 w-full"
      >
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? 'Error showing listings' : ''}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="Listing Cover Image"
                  className="h-20 w-20 object-cover"
                />
              </Link>
              <Link
                className="text-blue-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  <FaTrash className="text-sm mr-2" />
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">
                    <FaPencilAlt className="text-sm mr-2" />
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
