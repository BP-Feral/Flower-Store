import { useEffect, useState } from "react";
import { showError, showSuccess } from "../utils/toast.jsx";
import "../styles/commonStyles.css";

function CustomizationCard() {
  const [storeTitle, setStoreTitle] = useState("");
  const [faviconFile, setFaviconFile] = useState(null);
  const [showReloadNotice, setShowReloadNotice] = useState(false);
  const [bgColor, setBgColor] = useState("#101010");
  const [cardColor, setCardColor] = useState("#151515");
  const [navbarColor, setNavbarColor] = useState("#000000");

  const [bgImage, setBgImage] = useState("/assets/images/cartographer.png");
  const [navbarImage, setNavbarImage] = useState("/assets/images/cartographer.png");
  const [cardImage, setCardImage] = useState("/assets/images/arabesque.png");

  const [isExpanded, setIsExpanded] = useState(false);

  const themeImages = {
    1: "/assets/images/cartographer.png",
    2: "/assets/images/arabesque.png",
    3: "/assets/images/3px-tile.png",
    4: "/assets/images/black-orchid.png",
    5: "/assets/images/brick-wall-dark.png",
  };

  useEffect(() => {
    fetch("http://localhost:5000/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.store_title) {
          setStoreTitle(data.store_title);
          document.title = data.store_title;
        }
        if (data.favicon) {
          const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
          link.rel = "icon";
          link.href = `http://localhost:5000/uploads/${data.favicon}`;
          document.head.appendChild(link);
        }
        if (data.bg_color) setBgColor(data.bg_color);
        if (data.card_color) setCardColor(data.card_color);
        if (data.navbar_color) setNavbarColor(data.navbar_color);
        if (data.bg_image) setBgImage(data.bg_image);
        if (data.navbar_image) setNavbarImage(data.navbar_image);
        if (data.card_image) setCardImage(data.card_image);
      })
      .catch(() => showError("Failed to load store settings"));
  }, []);

  useEffect(() => {
    applyTheme(bgImage, bgColor, navbarImage, navbarColor, cardImage, cardColor);
  }, [bgImage, bgColor, navbarImage, navbarColor, cardImage, cardColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("store_title", storeTitle);
    if (faviconFile) formData.append("favicon", faviconFile);
    formData.append("bg_color", bgColor);
    formData.append("navbar_color", navbarColor);
    formData.append("card_color", cardColor);
    formData.append("bg_image", bgImage);
    formData.append("navbar_image", navbarImage);
    formData.append("card_image", cardImage);

    try {
      const res = await fetch("http://localhost:5000/settings/branding", {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      showSuccess("Branding updated successfully");
      setShowReloadNotice(true);
      document.title = storeTitle;
    } catch (err) {
      showError("Error saving branding");
    }
  };

  const handleResetToDefault = () => {
    setBgColor("#101010");
    setCardColor("#151515");
    setNavbarColor("#000000");
    setBgImage("/assets/images/cartographer.png");
    setNavbarImage("/assets/images/cartographer.png");
    setCardImage("/assets/images/arabesque.png");
  };

  const applyTheme = (bgImg, bg, navImg, nav, cardImg, card) => {
    const body = document.body;
    const navbarEl = document.querySelector("nav");
    const dropdown = document.querySelector(".dropdown");
    const cards = document.querySelectorAll(".card");

    body.style.backgroundColor = bg;
    body.style.backgroundImage = `url('${bgImg}')`;

    if (navbarEl) {
      navbarEl.style.backgroundColor = nav;
      navbarEl.style.backgroundImage = `url('${navImg}')`;
    }
    if (dropdown) {
      dropdown.style.backgroundColor = nav;
      dropdown.style.backgroundImage = `url('${navImg}')`;
    }
    cards.forEach(cardEl => {
      cardEl.style.backgroundColor = card;
      cardEl.style.backgroundImage = `url('${cardImg}')`;
    });
  };

  const renderThemeGrid = (selectedId, setImage) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {Object.entries(themeImages).map(([id, img]) => (
        <div
          key={id}
          onClick={() => setImage(img)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '6px',
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid white',
            boxShadow: selectedId === img ? '0 0 0 2px #10b981' : 'none',
            cursor: 'pointer',
          }}
          title={`Theme ${id}`}
        ></div>
      ))}
    </div>
  );

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="button"
        style={{ marginBottom: "1rem", backgroundColor: "#10b981" }}
      >
        {isExpanded ? "Hide Customization" : "Show Customization"}
      </button>

      {isExpanded && (
        <>
          <h2 className="heading">Store Customization</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="storeTitle" style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Store Title</label>
              <input
                type="text"
                id="storeTitle"
                placeholder="Flower Store"
                value={storeTitle}
                onChange={(e) => setStoreTitle(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="favicon" style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Favicon</label>
              <input
                type="file"
                id="favicon"
                accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                onChange={(e) => setFaviconFile(e.target.files[0])}
                className="input"
              />
            </div>

            <div>
              <h4 style={{ color: 'white', marginTop: '1rem' }}>Background Theme</h4>
              {renderThemeGrid(bgImage, setBgImage)}
              <label style={{ display: 'block', marginTop: '0.5rem', color: 'white' }}>Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '80px', height: '40px', border: 'none', cursor: 'pointer' }}
              />
            </div>

            <div>
              <h4 style={{ color: 'white', marginTop: '1rem' }}>Navbar Theme</h4>
              {renderThemeGrid(navbarImage, setNavbarImage)}
              <label style={{ display: 'block', marginTop: '0.5rem', color: 'white' }}>Navbar Color</label>
              <input
                type="color"
                value={navbarColor}
                onChange={(e) => setNavbarColor(e.target.value)}
                style={{ width: '80px', height: '40px', border: 'none', cursor: 'pointer' }}
              />
            </div>

            <div>
              <h4 style={{ color: 'white', marginTop: '1rem' }}>Card Theme</h4>
              {renderThemeGrid(cardImage, setCardImage)}
              <label style={{ display: 'block', marginTop: '0.5rem', color: 'white' }}>Card Color</label>
              <input
                type="color"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                style={{ width: '80px', height: '40px', border: 'none', cursor: 'pointer' }}
              />
            </div>

            <button type="submit" className="button">Save Branding</button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="button"
              style={{ backgroundColor: '#6b7280' }}
            >
              Reset to Default
            </button>

            {showReloadNotice && (
              <p style={{ color: "crimson", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Reload the page (F5) to see the updated branding.
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default CustomizationCard;
