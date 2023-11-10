import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaShare,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import Contact from '../components/Contact';
import Report from '../components/Report';
const Listing = () => {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [report, setReport] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  return (
    <main className="container mx-auto px-4">
      {loading && (
        <p className="text-center my-7 text-2xl text-gray-700">Loading...</p>
      )}
      {error && (
        <p className="text-center my-7 text-2xl text-red-700">
          Something went wrong!
        </p>
      )}

      {listing && !loading && !error && (
        <div className="flex flex-wrap">
          <div className="w-full lg:w-3/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listing.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={listing.name}
                  className="w-full h-auto rounded-lg shadow-lg mb-4"
                />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-2/5 pl-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-extrabold">{listing.name}</h1>
              {listing.offer && (
                <span className="bg-green-900 text-white text-sm px-2 py-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice} OFF
                </span>
              )}
            </div>
            <p className="text-gray-600">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <p className="text-lg font-semibold text-blue-700">
              $
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <p className="text-gray-800 mt-4">
              <span className="font-semibold">Description:</span>{' '}
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm mt-4">
              <li className="flex items-center mb-2">
                <FaBed className="text-lg mr-1" />
                {listing.bedrooms} {listing.bedrooms > 1 ? 'beds' : 'bed'}
              </li>
              <li className="flex items-center mb-2">
                <FaBath className="text-lg mr-1" />
                {listing.bathrooms} {listing.bathrooms > 1 ? 'baths' : 'bath'}
              </li>
              <li className="flex items-center mb-2">
                <FaParking className="text-lg mr-1" />
                {listing.parking ? 'Parking spot' : 'No Parking'}
              </li>
              <li className="flex items-center">
                <FaChair className="text-lg mr-1" />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-blue-700 text-white rounded-lg uppercase hover:opacity-95 p-3 m-6"
              >
                Contact Landlord
              </button>
            )}
            {currentUser && listing.userRef !== currentUser._id && !report && (
              <button
                onClick={() => setReport(true)}
                className="bg-red-700 text-white rounded-lg uppercase hover:opacity-95 p-3 m-6"
              >
                Report Listing
              </button>
            )}
          </div>
        </div>
      )}
      {contact && <Contact listing={listing} />}
      {report && <Report listing={listing} />}
      <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-gray-100 cursor-pointer">
        <FaShare
          className="text-gray-500"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          }}
        />
      </div>
      {copied && (
        <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-gray-100 p-2 text-gray-700">
          Link copied!
        </p>
      )}
    </main>
  );
};

export default Listing;
