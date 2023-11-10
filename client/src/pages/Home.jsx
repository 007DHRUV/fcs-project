import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchData = async (url, setState) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData('/api/listing/get?offer=true&limit=4', setOfferListings);
    fetchData('/api/listing/get?type=rent&limit=4', setRentListings);
    fetchData('/api/listing/get?type=sale&limit=4', setSaleListings);
  }, []);

  return (
    <div className="bg-gray-100">
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Find Your Next <span className="text-yellow-300">Perfect</span> Place with High Security
          </h1>
          <Link to="/search" className="bg-yellow-300 text-blue-800 px-6 py-3 rounded-lg hover:bg-yellow-400 text-lg font-semibold transition duration-300">
            Start Your Search
          </Link>
        </div>
      </section>

      <section className="container mx-auto my-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-700">
            Recent Offers
          </h2>
          <Link to="/search?offer=true" className="text-blue-600 hover:underline text-lg">
            See More Offers
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {offerListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </section>

      <section className="container mx-auto my-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-700">
            Recent Places For Rent
          </h2>
          <Link to="/search?type=rent" className="text-blue-600 hover:underline text-lg">
            Explore More Rentals
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rentListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </section>

      <section className="container mx-auto my-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-700">
            Recent Places For Sale
          </h2>
          <Link to="/search?type=sale" className="text-blue-600 hover:underline text-lg">
            Discover More for Sale
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saleListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
           ) )}
        </div>
      </section>
    </div>
  );
};

export default Home;
