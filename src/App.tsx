import Nav from './components/Nav';
import WaveCanvas from './components/WaveCanvas';
import PortholeFrame from './components/PortholeFrame';
import FormField from './components/FormField';
import Hero from './sections/Hero';
import About from './sections/About';
import Expertise from './sections/Expertise';
import VoyageLog from './sections/VoyageLog';
import Gallery from './sections/Gallery';
import Impact from './sections/Impact';
import Goals from './sections/Goals';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

/**
 * Root application component, lays out all sections in order.
 */
export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Expertise />
        <VoyageLog />
        <Gallery />
        <Impact />
        <Goals />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
