import { useEffect, useState } from "react";

function CameraSettingsSection() {
  const [enabled, setEnabled] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [newCamera, setNewCamera] = useState({ name: "", rtsp_url: "" });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/camera-feature")
      .then(res => res.json())
      .then(data => setEnabled(data.enabled));

    fetchCameras();
  }, []);

  const fetchCameras = () => {
    fetch("http://localhost:5000/cameras")
      .then(res => res.json())
      .then(setCameras);
  };

  const toggleFeature = () => {
    fetch("http://localhost:5000/camera-feature", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    })
      .then(res => res.json())
      .then(data => setEnabled(data.enabled));
  };

  const addCamera = () => {
    if (!newCamera.name || !newCamera.rtsp_url) return;
    fetch("http://localhost:5000/cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCamera),
    })
      .then(res => res.json())
      .then(() => {
        setNewCamera({ name: "", rtsp_url: "" });
        fetchCameras();
      });
  };

  const deleteCamera = (id) => {
    fetch(`http://localhost:5000/cameras/${id}`, { method: "DELETE" })
      .then(() => fetchCameras());
  };

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="button"
        style={{ marginBottom: "1rem", backgroundColor: "#10b981" }}
      >
        {isExpanded ? "Hide Camera Settings" : "Show Camera Settings"}
      </button>

      {isExpanded && (
        <>
          <h3 className="heading">Camera Management</h3>

          <label className="toggle">
            <input type="checkbox" checked={enabled} onChange={toggleFeature} />
            Enable Cameras
          </label>

          {enabled && (
            <>
              <h4>Add New Camera</h4>
              <input
                type="text"
                placeholder="Camera Name"
                value={newCamera.name}
                onChange={e => setNewCamera({ ...newCamera, name: e.target.value })}
                className="input"
              />
              <input
                type="password"
                placeholder="RTSP URL"
                value={newCamera.rtsp_url}
                onChange={e => setNewCamera({ ...newCamera, rtsp_url: e.target.value })}
                className="input"
              />
              <button onClick={addCamera} className="createButton">Add Camera</button>

              <h4>Existing Cameras</h4>
              {cameras.map(cam => (
                <div key={cam.id} className="cameraItem">
                  <strong style={{ marginRight: '1rem' }}>{cam.name}</strong>
                  <button onClick={() => deleteCamera(cam.id)} className="deleteButton">Delete</button>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CameraSettingsSection;
