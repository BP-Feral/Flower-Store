import { useEffect, useState, useRef } from "react";
import "../styles/AdminLayout.css"
import "../styles/FormControlsLayout.css"

const CameraFeed = () => {
  const [cameras, setCameras] = useState([]);
  const [activeCamId, setActiveCamId] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/cameras")
      .then(res => res.json())
      .then(data => {
        setCameras(data);
        if (data.length > 0) setActiveCamId(data[0].id);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (imgRef.current) {
        imgRef.current.src = "";
      }
    };
  }, [activeCamId]);

  const activeCam = cameras.find(cam => cam.id === activeCamId);

  return (
    <div className="pageWrapper">

      {/* Camera selection buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {cameras.map((cam) => (
          <button
            key={cam.id}
            onClick={() => setActiveCamId(cam.id)}
            className={`px-4 py-2 rounded ${
              cam.id === activeCamId ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {cam.name}
          </button>
        ))}
      </div>

      {/* Active camera view */}
      {activeCam && activeCam.id ? (
        <div className="border rounded shadow p-2">
          <h3 className="text-lg font-semibold mb-2 text-center">{activeCam.name}</h3>
          <img
            src={`http://localhost:5000/cameras/${activeCam.id}/stream`}
            alt={`Camera ${activeCam.name}`}
            className="mx-auto w-full max-w-xl h-80 object-cover rounded border"
            style={{ border: "2px solid green" }}
          />
        </div>
      ) : (
        <p>No camera selected or no camera available</p>
      )}

    </div>
  );
};

export default CameraFeed;
