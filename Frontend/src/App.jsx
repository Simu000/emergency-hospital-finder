import { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const userIcon = new L.DivIcon({
  html: `<div style="
    width:18px;height:18px;background:#c0392b;border:3px solid white;
    border-radius:50%;box-shadow:0 0 0 3px rgba(192,57,43,0.3),0 2px 8px rgba(0,0,0,0.3)">
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: "",
});

const makeHospitalIcon = (selected = false) =>
  new L.DivIcon({
    html: `<div style="
      width:${selected ? 36 : 30}px;height:${selected ? 36 : 30}px;
      background:${selected ? "#c0392b" : "#fff"};
      border:2.5px solid ${selected ? "#fff" : "#c0392b"};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:${selected ? "0 0 0 4px rgba(192,57,43,0.25)," : ""}0 2px 8px rgba(0,0,0,0.25);
      font-size:${selected ? 17 : 14}px;
      transition:all 0.2s;
    "></div>`,
    iconSize: [selected ? 36 : 30, selected ? 36 : 30],
    iconAnchor: [selected ? 18 : 15, selected ? 18 : 15],
    className: "",
  });


function RecenterMap({ location, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView(location, zoom || 13, { animate: true });
  }, [location, zoom]);
  return null;
}

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], animate: true });
  }, [bounds]);
  return null;
}


const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const mockBeds = () => {
  const r = Math.random();
  if (r < 0.2) return null;
  if (r < 0.4) return 0;
  return Math.floor(Math.random() * 50) + 1;
};

const mockContact = () =>
  `+91-9${Math.floor(100000000 + Math.random() * 900000000)}`;


function BedStatus({ beds }) {
  if (beds === null)
    return <span className="beds-unknown">⚪ Status unknown</span>;
  if (beds === 0)
    return <span className="beds-none">🚫 No beds available</span>;
  if (beds > 20)
    return <span className="beds-good">🛏 {beds} beds available</span>;
  if (beds >= 10)
    return <span className="beds-medium">🛏 {beds} beds available</span>;
  return <span className="beds-low">🛏 Only {beds} beds left</span>;
}


async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
        lat,
        lng,
      ]);
      const dist = (data.routes[0].distance / 1000).toFixed(1);
      const dur = Math.round(data.routes[0].duration / 60);
      return { coords, dist, dur };
    }
  } catch (e) {
    console.warn("Route fetch failed", e);
  }
  return null;
}


export default function App() {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [route, setRoute] = useState(null); // { coords, dist, dur }
  const [routeLoading, setRouteLoading] = useState(false);
  const [fitBounds, setFitBounds] = useState(null);
  const cardRefs = useRef({});

  const selectedHospital = hospitals.find((h) => h.id === selectedId);

  const findHospitals = () => {
    setLoading(true);
    setSelectedId(null);
    setRoute(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:15000,${latitude},${longitude});
            way["amenity"="hospital"](around:15000,${latitude},${longitude});
            relation["amenity"="hospital"](around:15000,${latitude},${longitude});
          );
          out center;
        `;

        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
        });

        const data = await res.json();

        const list = data.elements
          .map((el, i) => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            if (!lat || !lon) return null;
            return {
              id: i,
              name: el.tags?.name || "Unnamed Hospital",
              lat,
              lon,
              distance: calcDistance(latitude, longitude, lat, lon).toFixed(2),
              beds: mockBeds(),
              contact: mockContact(),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance);

        setHospitals(list);
        setLoading(false);
      },
      () => {
        alert("Location access denied. Please allow location to use this app.");
        setLoading(false);
      }
    );
  };

  const selectHospital = async (h) => {
    if (selectedId === h.id) {
      // Deselect
      setSelectedId(null);
      setRoute(null);
      return;
    }

    setSelectedId(h.id);
    setRoute(null);

    if (userLocation) {
      setRouteLoading(true);
      const routeData = await fetchRoute(userLocation, [h.lat, h.lon]);
      setRoute(routeData);
      setRouteLoading(false);

      setFitBounds([userLocation, [h.lat, h.lon]]);
    }

    setTimeout(() => {
      cardRefs.current[h.id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const clearSelection = () => {
    setSelectedId(null);
    setRoute(null);
    if (userLocation) setFitBounds(null);
  };

  const visibleHospitals =
    selectedId !== null
      ? hospitals.filter((h) => h.id === selectedId)
      : hospitals;

  return (
    <div className="app">
      <div className="header">
        <div className="header-title">
          <div>
            <h1>Emergency Hospital Finder</h1>
            <p className="tagline">Real-time nearby hospitals · Bed availability · Directions</p>
          </div>
        </div>
        <div className="header-actions">
          {selectedId !== null && (
            <button className="btn-back" onClick={clearSelection}>
              ← All Hospitals
            </button>
          )}
          <button className="btn-primary" onClick={findHospitals}>
            {hospitals.length > 0 ? "🔄 Refresh" : "📍 Find Nearby Hospitals"}
          </button>
        </div>
      </div>

      {(loading || routeLoading) && (
        <div className="loading-bar">
          <div className="loading-bar-inner" />
        </div>
      )}

      <div className="layout">
        <MapContainer
          center={userLocation || [28.6, 77.2]}
          zoom={13}
          className="map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />

          {userLocation && !fitBounds && (
            <RecenterMap location={userLocation} zoom={13} />
          )}

          {fitBounds && <FitBounds bounds={fitBounds} />}

          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="popup-inner">
                  <div className="popup-name">📍 Your Location</div>
                </div>
              </Popup>
            </Marker>
          )}

          {route && (
            <Polyline
              positions={route.coords}
              pathOptions={{
                color: "#c0392b",
                weight: 5,
                opacity: 0.8,
                dashArray: "0",
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          )}

          {visibleHospitals.map((h) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lon]}
              icon={makeHospitalIcon(h.id === selectedId)}
            >
              <Popup>
                <div>
                  <div className="popup-inner">
                    <div className="popup-name">{h.name}</div>
                    <div className="popup-row">📍 {h.distance} km away</div>
                    <div className="popup-row">
                      <BedStatus beds={h.beds} />
                    </div>
                    <div className="popup-row">📞 {h.contact}</div>
                  </div>
                  <button
                    className="popup-btn"
                    onClick={() => selectHospital(h)}
                  >
                    {h.id === selectedId ? "✓ Selected" : "Get Directions →"}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="dashboard">
          <div className="sidebar-header">
            {selectedId !== null ? (
              <>
                <h2>🔴 Route to Hospital</h2>
                <p>
                  {routeLoading
                    ? "Calculating route…"
                    : route
                    ? `~${route.dist} km · ~${route.dur} min by road`
                    : "Tap 'All Hospitals' to go back"}
                </p>
              </>
            ) : hospitals.length > 0 ? (
              <>
                <h2>Nearby Hospitals</h2>
                <p>{hospitals.length} found · Click any to get directions</p>
              </>
            ) : (
              <>
                <h2>Hospital Finder</h2>
                <p>Press the button to locate hospitals near you</p>
              </>
            )}
          </div>

          {hospitals.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏥</div>
              <h3>No hospitals loaded yet</h3>
              <p>
                Tap <strong>Find Nearby Hospitals</strong> to discover
                hospitals within 15 km of your location.
              </p>
            </div>
          ) : (
            <div className="hospital-list">
              {(selectedId !== null ? visibleHospitals : hospitals).map((h) => (
                <div
                  key={h.id}
                  ref={(el) => (cardRefs.current[h.id] = el)}
                  className={`card ${h.id === selectedId ? "selected" : ""}`}
                  onClick={() => selectHospital(h)}
                >
                  {h.id === selectedId && (
                    <div className="selected-badge">SELECTED</div>
                  )}

                  <div className="card-name">{h.name}</div>

                  <div className="card-row">
                    <span className="icon">📍</span>
                    <span>{h.distance} km away</span>
                  </div>

                  <div className="card-row">
                    <span className="icon">🛏</span>
                    <BedStatus beds={h.beds} />
                  </div>

                  <div className="card-row">
                    <span className="icon">📞</span>
                    <span>{h.contact}</span>
                  </div>

                  {h.id === selectedId && route && (
                    <div
                      className="card-row"
                      style={{ marginTop: 8, color: "#c0392b", fontWeight: 600 }}
                    >
                      <span className="icon">🗺</span>
                      <span>
                        {route.dist} km · ~{route.dur} min by road
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
