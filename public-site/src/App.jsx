import { Routes, Route } from 'react-router-dom';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CTA from './components/common/CTA';

// Pages
import Home from './pages/Home';
import Offers from './pages/Offers';
import OfferDetails from './pages/OfferDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Branches from './pages/Branches';
import About from './pages/About';

// Utils
import ScrollToTop from './components/common/ScrollToTop';

// Styles
import './styles/globals.css';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:slug" element={<OfferDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <CTA />
      <Footer />
    </>
  );
}
