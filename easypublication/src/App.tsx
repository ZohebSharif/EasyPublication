import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Admin from "./Admin";
import SlideshowView from "./SlideshowView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/slideshow" element={<SlideshowView />} />
      </Routes>
    </Router>
  );
}

export default App;