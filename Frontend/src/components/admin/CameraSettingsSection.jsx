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
        {isExpanded ? "Ascunde Setarile de Camera" : "Afiseaza Setarile de Camera"}
      </button>

      {isExpanded && (
        <>
          <h3 className="heading">Administrare Camere</h3>

          <label className="toggle">
            <input type="checkbox" checked={enabled} onChange={toggleFeature} />
            Activeaza Camerele
          </label>

          {enabled && (
            <>
              <h4>Adauga o camera</h4>
              <input
                type="text"
                placeholder="Nume Camera"
                value={newCamera.name}
                onChange={e => setNewCamera({ ...newCamera, name: e.target.value })}
                className="input"
              />
              <input
                type="password"
                placeholder="URL RTSP"
                value={newCamera.rtsp_url}
                onChange={e => setNewCamera({ ...newCamera, rtsp_url: e.target.value })}
                className="input"
              />
              <button onClick={addCamera} className="createButton">Adauga Camera</button>

              <h4>Camere Inregistrate</h4>
              {cameras.map(cam => (
                <div key={cam.id} className="cameraItem">
                  <strong style={{ marginRight: '1rem' }}>{cam.name}</strong>
                  <button onClick={() => deleteCamera(cam.id)} className="deleteButton">Elimina</button>
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
