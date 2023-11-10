import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);

    const searchQuery = urlParams.toString();

    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  console.log(currentUser)

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center">
            <span className="text-yellow-300 mr-2">Real Estate</span>
            <span className="text-white">Aggregator</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-80 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64 text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-blue-500" />
          </button>
        </form>
        <ul className="flex gap-4 text-white">
          <Link to="/">
            <li className="text-lg hover:underline hover:text-white-300 transition duration-300 bg-yellow-300 text-blue-800 px-4 py-4 rounded-lg  hover ">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="text-lg hover:underline hover:text-white-300 transition duration-300 bg-yellow-300 text-blue-800 px-4 py-4 rounded-lg  hover">
              About
            </li>
          </Link>

          <Link to="/profile">
            {currentUser ? (
              <img
                className="rounded-full h-16 w-17 object-cover border-2 border-yellow-300"
                src={ currentUser.avatar}
                alt="profile"
              />
            ) : (
              <li className="text-lg hover:underline hover:text-white-300 transition duration-300 bg-yellow-300 text-blue-800 px-4 py-4 rounded-lg  hover ">Sign In</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;
