import React, { useEffect, useState, useRef } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

import 'react-simple-keyboard/build/css/index.css';

const UpdateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
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
  const [activeInput, setActiveInput] = useState(null);
  const keyboard = useRef(null);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setFormData(data);
    };
    fetchListing();
  }, []);

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

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
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
        Update a Listing
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
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                id="rent"
                checked={formData.type === 'rent'}
                onChange={handleChange}
              />
              Rent
            </label>
            <label>
              <input
                type="radio"
                id="sale"
                checked={formData.type === 'sale'}
                onChange={handleChange}
              />
              Sale
            </label>
          </div>
          <div className="flex gap-4">
            <label>
              Bedrooms
              <input
                type="number"
                id="bedrooms"
                min="1"
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
            </label>
            <label>
              Bathrooms
              <input
                type="number"
                id="bathrooms"
                min="1"
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label>
              Regular Price ($)
              <input
                type="number"
                id="regularPrice"
                min="0"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
            </label>
            <label>
              Discount Price ($)
              <input
                type="number"
                id="discountPrice"
                min="0"
                required
                onChange={handleChange}
                value={formData.discountPrice}
              />
            </label>
          </div>
          <div className="flex gap-4 items-center">
            <label>
              Offer
              <input
                type="checkbox"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
              />
            </label>
            <label>
              Parking
              <input
                type="checkbox"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
              />
            </label>
            <label>
              Furnished
              <input
                type="checkbox"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
              />
            </label>
          </div>
        </div>
        <Keyboard
          keyboardRef={(r) => (keyboard.current = r)}
          layoutName="default"
          inputName={activeInput}
          onKeyPress={onKeyPress}
        />

        <div className="flex flex-col gap-4">
          <label>
            Images (max 6)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              className="bg-blue-500 text-white p-2 rounded-lg"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </label>
          {imageUploadError && (
            <p className="text-red-500">{imageUploadError}</p>
          )}
          {formData.imageUrls.length > 0 && (
            <div className="flex gap-2">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Listing ${index + 1}`}
                    className="rounded-lg w-16 h-16 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="bg-gray-500 text-white p-3 rounded-lg"
            onClick={() => navigate(`/listing/${params.listingId}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Listing'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;
