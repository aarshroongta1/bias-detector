import { useState, useRef } from "react";

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-subtitle">
          Resolve implicit bias in your writing to ensure all your
          communications are inclusive and respectful.
        </p>
        <div className="hero-cta">
          <a
            href={import.meta.env.VITE_CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-chrome"
          >
            Get Chrome Extension
          </a>
          <button className="btn btn-secondary" onClick={scrollToDemo}>
            Try Demo
          </button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="demo-video-container">
          <video
            ref={videoRef}
            className="demo-video"
            controls={isPlaying}
            playsInline
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
          {!isPlaying && (
            <div className="video-play-overlay" onClick={handlePlayClick}>
              <div className="play-button">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
