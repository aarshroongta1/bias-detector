import AnimatedTitle from './components/AnimatedTitle'
import Hero from './components/Hero'
import About from './components/About'
import Demo from './components/Demo'
import BiasCategories from './components/BiasCategories'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">B</span>
          <span className="nav-title">Bias Detector</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#demo">Try It</a>
          <a href="#categories">Categories</a>
          <a href="#download" className="btn btn-nav">Download</a>
        </div>
      </nav>

      <main>
        <AnimatedTitle />
        <Hero />
        <About />
        <Demo />
        <BiasCategories />
      </main>

      <Footer />
    </div>
  )
}

export default App
