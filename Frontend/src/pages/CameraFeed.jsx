import { useEffect, useState } from "react";
import HlsPlayer from "../components/HlsPlayer";

const CameraFeed = () => {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/cameras")
      .then(res => res.json())
      .then(setCameras);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Live Camera Feeds</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((cam) => (
          <div key={cam.id}>
            <h3 className="text-lg font-semibold">{cam.name}</h3>
            <HlsPlayer url={`http://localhost:5000/static/cameras/${cam.id}/stream.m3u8`} />
          </div>
        ))}
      </div>
    </div>
  );
};

  
  export default CameraFeed;