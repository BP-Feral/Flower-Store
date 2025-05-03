function About() {
    return (
      <div className="pageWrapper">
        <h1 className="heading">About This Project</h1>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "1rem auto", color: "#ccc", lineHeight: "1.8" }}>
        This application was developed as part of my final Bachelor's thesis project in computer science. What began as a
        simple online flower store evolved over time into a more general-purpose shopping platform, incorporating a range
        of advanced features including admin control panels, camera integrations, product tagging, and dynamic filtering.
        <br /><br />
        The project was inspired by my family's real-world experience in flower production. As development progressed,
        it naturally transitioned from a narrow niche into a flexible, modular system capable of supporting a variety
        of products and use cases. My goal was to build a highly customizable platform that demonstrates a complete
        full-stack workflow, strong user interface design, and real-time system integration all while maintaining an accessible,
        user-friendly experience.
        <br /><br />
        Every component, from product creation to cart management and permissions-based access, was carefully crafted to reflect
        practical needs and academic rigor.
      </p>
        <div style={{ textAlign: "center", marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a
            href="https://discordapp.com/invite/xcEYBpn2k2"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#5865F2",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500"
            }}
          >
            Contact on Discord
          </a>
  
          <a
            href="https://github.com/BP-Feral"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#24292e",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500"
            }}
          >
            View on GitHub
          </a>
  
          <a
            href="mailto:mihai.pricob@yahoo.com"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500"
            }}
          >
            Email Me
          </a>
        </div>
      </div>
    );
  }
  
  export default About;
  