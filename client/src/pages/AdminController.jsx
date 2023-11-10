import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminController = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async (url, setState) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Log the response to check its structure

        setState(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData('/api/listing/getall', setListings);
    fetchData('/api/user/test', setUsers);

  }, []);

  let isadmin = String(currentUser.user) === 'admin';

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/admindelete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleUserDelete = async (userId) => {
    try {
      const res = await fetch(`/api/user/admindelete/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="bg-gray-100">
      {isadmin && (
        <div>
          <h1 className="text-center text-blue-700 mt-7 text-3xl font-extrabold">
            Welcome Admin
          </h1>
          {listings && listings.length > 0 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-center mt-7 text-2xl font-semibold">All Listings</h1>
              {listings.map((listing) => (
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
                  </div>
                </div>
              ))}
            </div>
          )}
          {users && users.length > 0 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-center mt-7 text-2xl font-semibold">All Users</h1>
              {users.map((user) => (
                <div
                  key={user._id}
                  className="border rounded-lg p-3 flex justify-between items-center gap-4"
                >
                  <Link to={`/user/${user._id}`}>
                    <img
                      src={user.avatar}
                      alt="user Cover Image"
                      className="h-20 w-20 object-cover"
                    />
                  </Link>
                  <Link
                    className="text-blue-700 font-semibold hover:underline truncate flex-1"
                    to={`/user/${user._id}`}
                  >
                    <p>{user.username}</p>
                  </Link>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleUserDelete(user._id)}
                      className="text-red-700 uppercase"
                    >
                      <FaTrash className="text-sm mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminController;
