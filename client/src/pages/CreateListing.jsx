import React, { useState, useRef } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const CreateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const keyboard = useRef(null);
  const [activeInput, setActiveInput] = useState(null);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload is failed (2mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing!');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done!`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image!');

      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');

      setLoading(true);
      setError(false);

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  // const onKeyPress = (button) => {
  //   if (activeInput && button !== '{enter}') {
  //     const inputId = activeInput;
  //     const existingValue = formData[inputId] || ''; // Get the existing value or an empty string
  //     const newFormData = {
  //       ...formData,
  //       [inputId]: existingValue + button, // Append the pressed key to the existing value
  //     };
  //     setFormData(newFormData);
  
  //     // Manually set focus on the input field after pressing a key on the keyboard
  //     const inputElement = document.getElementById(inputId);
  //     if (inputElement) {
  //       inputElement.value = newFormData[inputId]; // Set the input value
  //       inputElement.focus(); // Set the focus
  //     }
  //   }
  // };

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

  

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleInputChange}
            value={formData.name}
            onFocus={() => setActiveInput('name')}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleInputChange}
            value={formData.description}
            onFocus={() => setActiveInput('description')}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleInputChange}
            value={formData.address}
            onFocus={() => setActiveInput('address')}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === 'sale'}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min={'1'}
                max={'50'}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min={'1'}
                max={'50'}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min={'50'}
                max={'100000000'}
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min={'0'}
                  max={'100000000'}
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">($ / Month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <Keyboard
          keyboardRef={(r) => (keyboard.current = r)}
          layoutName="default"
          inputName={activeInput}
          onKeyPress={onKeyPress}
        />

        <p className="font-semibold">
          Images:
          <span className="font-normal text-gray-600 ml-2">
            The first image will be the cover (max 6)
          </span>
        </p>
        <div className="flex gap-4">
          <input
            onChange={(e) => setFiles(e.target.files)}
            className="p-3 border border-gray-300 rounded w-full"
            type="file"
            id="images"
            accept="image/*"
            multiple
          />
          <button
            onClick={handleImageSubmit}
            disabled={uploading}
            type="button"
            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <p className="text-red-700 text-sm">
          {imageUploadError && imageUploadError}
        </p>
        {formData.imageUrls.length > 0 &&
          formData.imageUrls.map((url, index) => (
            <div
              key={url}
              className="flex justify-between p-3 border items-center"
            >
              <img
                src={url}
                alt="listing image"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className=" bg-red-700 p-3 text-white rounded-lg uppercase hover:opacity-75"
              >
                Delete
              </button>
            </div>
          ))}

        <button
          disabled={loading || uploading}
          className="p-3 bg-blue-700 text-white rounded-lg uppercase hover:opacity-90 disabled:opacity-80"
        >
          {loading ? 'Creating....' : 'Create Listing'}
        </button>
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </form>
    </main>
  );
};
export default CreateListing;
