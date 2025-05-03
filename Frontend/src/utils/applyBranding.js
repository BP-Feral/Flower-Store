// src/utils/applyBranding.js
export const themeImages = {
    1: "/assets/images/cartographer.png",
    2: "/assets/images/green_fibers.png",
    3: "/assets/images/lavender_dots.png",
    4: "/assets/images/sunset_stripes.png",
    5: "/assets/images/neon_grid.png",
  };
  
  export function applyBrandingSettings(settings) {
    const themeId = Number(settings.theme || 1);
    const bgColor = settings.bg_color || "#101010";
    const bgImage = themeImages[themeId];
  
    const body = document.body;
    const navbar = document.querySelector("nav");
    const dropdown = document.querySelector(".dropdown");
  
    body.style.backgroundColor = bgColor;
    body.style.backgroundImage = `url('${bgImage}')`;
  
    if (navbar) {
      navbar.style.backgroundColor = bgColor;
      navbar.style.backgroundImage = `url('${bgImage}')`;
    }
  
    if (dropdown) {
      dropdown.style.backgroundColor = bgColor;
      dropdown.style.backgroundImage = `url('${bgImage}')`;
    }
  
    if (settings.store_title) {
      document.title = settings.store_title;
    }
  
    if (settings.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = `http://localhost:5000/uploads/${settings.favicon}`;
    }
  }
  