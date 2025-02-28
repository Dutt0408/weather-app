import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/loader";
import "../App.css"
const apiKey = "94a3fb7ccb30a0fbe7f24b818bf27bf9"; 

interface City {
  name: string;
  country: string;
}

const Home: React.FC = () => {
  const [city, setCity] = useState("");
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (city.trim() === "") {
      setCitiesList([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.length === 0) {
          setCitiesList([]);
        } else {
         
          const uniqueCities = data.filter(
            (city: City, index: number, self: City[]) =>
              index === self.findIndex((c) => c.name === city.name && c.country === city.country)
          );

          setCitiesList(uniqueCities);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCities, 500);
    return () => clearTimeout(timeoutId); 
  }, [city]);

  // Handle city selection
  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setSelectedCity(selectedCity); 
    setCitiesList([]); 
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      setIsModalOpen(true);
      return;
    }
    setError(""); 
    setShowLoader(true);

    try {
      const searchCity = selectedCity || city;
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        setError("City not found");
        setIsModalOpen(true);
        setShowLoader(false); 
        return;
      }
      const { lat, lon } = geoData[0];
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      // eslint-disable-next-line 
      const weatherData = await weatherRes.json();

      setTimeout(() => {
        setShowLoader(false);
        navigate(`/weather/${encodeURIComponent(searchCity)}`);
      }, 4000); 
    } catch (err) {
      setError("Failed to fetch weather");
      setIsModalOpen(true);
      setShowLoader(false);
    }
  };

  const shouldShowDropdown = city && !loading && citiesList.length > 0;

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://www.warth-schroecken.at/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbg-weather-winter.3bdbac00.webp&w=3840&q=75')" }}
    >
      <div className="Modalui">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Weather Search</h1>

        <input
          type="text"
          placeholder="Enter city name"
          className="border-2 border-gray-300 p-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-4"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 mx-auto"></div>
          </div>
        )}


{shouldShowDropdown && (
  <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-50">
    {citiesList.map((cityName, index) => (
      <li
        key={index}
        className="p-3 text-gray-800 hover:bg-blue-100 cursor-pointer transition-all flex justify-between items-center"
        onClick={() => handleCitySelect(`${cityName.name}, ${cityName.country}`)}
      >
        <span className="text-md font-medium">{cityName.name}</span>
        <span className="text-sm text-gray-500">{cityName.country}</span>
      </li>
    ))}
  </ul>
)}

        <button
          className="buttonui"
          onClick={handleSearch}
        >
          Get Weather
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error}</p>
            <button
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-600"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showLoader && <Loader />}
    </div>
  );
};

export default Home;
