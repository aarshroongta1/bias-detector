export default function Hero() {
  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-subtitle">
          Resolve implicit bias in your writing to ensure in all your
          communications are inclusive and respectful.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={scrollToDemo}>
            Try Demo
          </button>
          <a href="#platforms" className="btn btn-secondary">
            View Integrations
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="demo-video-container">
          <video
            className="demo-video"
            autoPlay
            loop
            muted
            playsInline
            poster="/demo-poster.png"
          >
            <source src="/demo.mp4" type="video/mp4" />
            <source src="/demo.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </section>
  );
}
