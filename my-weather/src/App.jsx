import { useState } from "react";
import "./App.css";

function getInfo(code) {
  if (code === 0) return { text: "Clear sky", icon: "☀️", theme: "sunny" };
  if (code <= 2) return { text: "Partly cloudy", icon: "⛅", theme: "cloudy" };
  if (code === 3) return { text: "Overcast", icon: "☁️", theme: "cloudy" };
  if (code <= 48) return { text: "Fog", icon: "🌫️", theme: "cloudy" };
  if (code <= 57) return { text: "Drizzle", icon: "🌦️", theme: "rainy" };
  if (code <= 67) return { text: "Rain", icon: "🌧️", theme: "rainy" };
  if (code <= 77) return { text: "Snow", icon: "❄️", theme: "cloudy" };
  if (code <= 82) return { text: "Rain showers", icon: "🌧️", theme: "rainy" };
  if (code <= 86) return { text: "Snow showers", icon: "🌨️", theme: "cloudy" };
  return { text: "Thunderstorm", icon: "⛈️", theme: "stormy" };
}

const quickCities = ["Chennai", "Puducherry", "Mumbai", "Delhi"];

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const temp = (c) => (unit === "C" ? Math.round(c) : Math.round((c * 9) / 5 + 32));

  async function getWeather(searchCity) {
    const query = (searchCity ?? city).trim();
    if (!query) {
      setError("City name podunga!");
      return;
    }
    setCity(query);
    setError("");
    setData(null);
    setLoading(true);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results) {
        setError("City kedaikala.");
        setLoading(false);
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];

      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&timezone=auto&forecast_days=5`
      );
      const w = await wRes.json();

      setData({
        name,
        country,
        current: w.current,
        daily: w.daily,
      });
    } catch (err) {
      setError("Error vandhuduchu. Internet check pannunga.");
    }
    setLoading(false);
  }

  const currentInfo = data ? getInfo(data.current.weather_code) : null;
  const theme = currentInfo ? currentInfo.theme : "default";

  return (
    <div className={`page ${theme}`}>
      <div className="card">
        <div className="top">
          <h2>Weather App</h2>
          <div className="toggle">
            <button
              className={unit === "C" ? "active" : ""}
              onClick={() => setUnit("C")}
            >
              °C
            </button>
            <button
              className={unit === "F" ? "active" : ""}
              onClick={() => setUnit("F")}
            >
              °F
            </button>
          </div>
        </div>

        <div className="search">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
            placeholder="Enter city (e.g. Chennai)"
          />
          <button className="search-btn" onClick={() => getWeather()}>
            Search
          </button>
        </div>

        <div className="chips">
          {quickCities.map((c) => (
            <button key={c} className="chip" onClick={() => getWeather(c)}>
              {c}
            </button>
          ))}
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {data && (
          <>
            <div className="main">
              <h3>
                {data.name}, {data.country}
              </h3>
              <div className="icon">{currentInfo.icon}</div>
              <div className="temp">
                {temp(data.current.temperature_2m)}°{unit}
              </div>
              <p className="condition">{currentInfo.text}</p>
              <p className="feels">
                Feels like {temp(data.current.apparent_temperature)}°{unit}
              </p>
            </div>

            <div className="stats">
              <div>
                💧 <span>{data.current.relative_humidity_2m}%</span>
                <small>Humidity</small>
              </div>
              <div>
                💨 <span>{data.current.wind_speed_10m} km/h</span>
                <small>Wind</small>
              </div>
            </div>

            <h4>5-Day Forecast</h4>
            <div className="forecast">
              {data.daily.time.map((day, i) => (
                <div className="day" key={day}>
                  <p>
                    {new Date(day).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <div className="day-icon">
                    {getInfo(data.daily.weather_code[i]).icon}
                  </div>
                  <p className="hi">{temp(data.daily.temperature_2m_max[i])}°</p>
                  <p className="lo">{temp(data.daily.temperature_2m_min[i])}°</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;