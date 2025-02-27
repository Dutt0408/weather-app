import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/loader";

const apiKey = "94a3fb7ccb30a0fbe7f24b818bf27bf9"; // Replace with your actual API key

const Weather: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const decodedCity = decodeURIComponent(city || ""); // Decode the city name
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${decodedCity}&limit=1&appid=${apiKey}`
        );
        const geoData = await geoRes.json();
        if (geoData.length === 0) {
          setError("City not found");
          setLoading(false);
          return;
        }

        const { lat, lon } = geoData[0];
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weather");
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return (
    <div className="flex items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://www.warth-schroecken.at/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbg-weather-winter.3bdbac00.webp&w=3840&q=75')" }}>
      <div className="Modalui">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-red-600 font-bold">{error}</div>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {weather.name}
            </div>
            <div className="flex justify-center mb-4">
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
                className="w-16 h-16"
              />
            </div>
            <div className="text-xl font-semibold text-gray-600 mb-4">
              {weather.weather[0].description}
            </div>
            <div className="text-6xl font-extrabold text-white">
              {weather.main.temp}°C
            </div>
            <div className="mt-4">
              <p className="text-gray-300">
                Feels like: {weather.main.feels_like}°C
              </p>
              <p className="text-gray-300">
                Humidity: {weather.main.humidity}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;