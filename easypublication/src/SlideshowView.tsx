import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeft from './assets/arrow-left-circle.png';
import ArrowRight from './assets/arrow-right-circle.png';
import './App.css';

interface Publication {
  id: number;
  title: string;
  category?: string;
  images: string[];
  logos?: string[];
  bulletPoints?: string[];
  abstract?: string;
}

const MAX_LOGOS = 8;
const MAX_BULLETS = 4;

function SlideshowView() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetch('/public/data/all-publications.json')
      .then(res => res.json())
      .then((data: Publication[]) => {
        const filtered = data.filter(pub => pub.images && pub.images.length > 0);
        setPublications(filtered);
      });
  }, []);

  useEffect(() => {
    setImageIndex(0);
  }, [currentIndex]);

  const currentPub = publications[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(idx => idx > 0 ? idx - 1 : publications.length - 1);
  };
  const handleNext = () => {
    setCurrentIndex(idx => idx < publications.length - 1 ? idx + 1 : 0);
  };
  const handleClose = () => {
    navigate('/');
  };
  const handleWebView = () => {
    setIsDark(false);
    navigate('/');
  };
  const handleSlideshowView = () => {
    setIsDark(true);
  };
  const handleImagePrev = () => {
    if (!currentPub?.images) return;
    setImageIndex(idx => idx > 0 ? idx - 1 : currentPub.images.length - 1);
  };
  const handleImageNext = () => {
    if (!currentPub?.images) return;
    setImageIndex(idx => idx < currentPub.images.length - 1 ? idx + 1 : 0);
  };

  return (
    <div className="App" style={{ overflow: 'hidden', height: '100vh', background: isDark ? '#181d27' : '#fff', color: isDark ? '#fff' : '#181d27' }}>
      {/* Header with Title and View Buttons */}
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
        <h1 style={{ 
          fontSize: '2em',
          margin: 0,
          fontFamily: 'monospace',
          fontWeight: 'normal',
          paddingLeft: '320px',
          paddingRight: '20px',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.2',
          maxHeight: '2.4em',
          textAlign: 'left'
        }}>{currentPub?.title || '3D Data Visual'}</h1>

        <div className="buttonContainer" style={{ position: 'absolute', left: '20px', zIndex: 2 }}>
          <button className="buttonOne" onClick={handleWebView} style={{ 
            background: isDark ? '#181d27' : '#fff', 
            color: isDark ? '#fff' : '#181d27', 
            border: isDark ? '2px solid #fff' : '2px solid #181d27', 
            fontWeight: 700, 
            fontFamily: 'Inter, Arial, sans-serif',
            minWidth: 'fit-content'
          }}>Web View</button>
          <button className="buttonTwo" onClick={handleSlideshowView} style={{ 
            background: isDark ? '#fff' : '#181d27', 
            color: isDark ? '#181d27' : '#fff', 
            border: isDark ? '2px solid #fff' : '2px solid #181d27', 
            fontWeight: 700, 
            fontFamily: 'Inter, Arial, sans-serif',
            minWidth: 'fit-content'
          }}>Slideshow View</button>
        </div>
      </div>

      {/* Slideshow Box */}
      <div style={{
        position: 'relative',
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
        gap: '24px',
        padding: '0 24px',
        marginTop: '-5px' // Changed from -20px to -5px to drop boxes by 15px
      }}>
        {/* Navigation Arrows */}
        <button onClick={handlePrev} style={{
          position: 'absolute',
          left: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10
        }}>
          <img src={ArrowLeft} alt="Previous" style={{ width: '48px', height: '48px', filter: isDark ? 'invert(1)' : 'none' }} />
        </button>
        <button onClick={handleNext} style={{
          position: 'absolute',
          right: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10
        }}>
          <img src={ArrowRight} alt="Next" style={{ width: '48px', height: '48px', filter: isDark ? 'invert(1)' : 'none' }} />
        </button>

        {/* Main Content Box */}
        <div style={{
          background: isDark ? '#181d27' : 'white', 
          color: isDark ? '#fff' : '#181d27', 
          borderRadius: '18px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
          width: '800px',
          maxWidth: '65vw', 
          minHeight: '500px', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '32px 32px 24px 32px', 
          fontSize: '1rem', 
          fontFamily: 'Inter, Arial, sans-serif'
        }}>
          {/* Category and Close Button */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <button onClick={handleClose} style={{ 
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#000',
              padding: '0'
            }}>×</button>
            <a href="#" style={{ 
              color: isDark ? '#bfc6d1' : '#414651',
              textDecoration: 'none',
              borderBottom: '1px solid',
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}>
              {currentPub?.category || 'Physics and Condensed Matter'}
            </a>
          </div>

          {/* Image/Carousel Row */}
          <div style={{ width: '100%', position: 'relative', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Large Image */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px', height: '480px', maxHeight: '65vh' }}>
              {currentPub?.images && currentPub.images.length > 0 && (
                <img src={currentPub.images[imageIndex]} alt={`Figure ${imageIndex + 1}`} style={{ 
                  height: '100%', 
                  maxHeight: '480px', 
                  maxWidth: '100%', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
                  objectFit: 'contain' 
                }} />
              )}
            </div>
            {/* Figure Number bottom left, Arrows bottom right */}
            <div style={{ width: '100%', position: 'absolute', left: 0, bottom: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
              {/* Figure Number */}
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: isDark ? '#fff' : '#181d27', padding: '4px 12px', borderRadius: '8px', background: isDark ? '#23283a' : '#f5f5f5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginLeft: '8px', marginBottom: '8px', pointerEvents: 'auto' }}>
                {currentPub?.images && currentPub.images.length > 0 ? `Figure ${imageIndex + 1}` : ''}
              </div>
              {/* Arrows bottom right */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px', marginRight: '8px', marginBottom: '8px', pointerEvents: 'auto' }}>
                <button onClick={handleImagePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <img src={ArrowLeft} alt="Prev" style={{ width: '28px', height: '28px', filter: isDark ? 'invert(1)' : 'none' }} />
                </button>
                <button onClick={handleImageNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <img src={ArrowRight} alt="Next" style={{ width: '28px', height: '28px', filter: isDark ? 'invert(1)' : 'none' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Abstract below image row */}
          <div style={{ 
            marginTop: '12px', 
            minHeight: '60px', 
            color: isDark ? '#bfc6d1' : '#414651', 
            fontSize: '1rem', 
            textAlign: 'left',
            lineHeight: '1.5'
          }}>
            {currentPub?.abstract || 'No abstract available.'}
          </div>

          {/* Logos/Images at Bottom Left */}
          <div style={{ position: 'absolute', left: '32px', bottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {currentPub?.logos?.slice(0, MAX_LOGOS).map((logo, idx) => (
              <img key={idx} src={logo} alt={`Logo ${idx + 1}`} style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px', background: '#f5f5f5', border: '1px solid #eee' }} />
            ))}
          </div>
        </div>

        {/* Right: Bullet Points */}
        <div style={{
          background: isDark ? '#181d27' : 'white', 
          color: isDark ? '#fff' : '#181d27', 
          borderRadius: '18px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
          width: '280px',
          maxWidth: '25vw', 
          minHeight: '500px', 
          padding: '32px 32px 24px 32px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: '18px', 
          fontSize: '1rem', 
          fontFamily: 'Inter, Arial, sans-serif'
        }}>
          <h3 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '12px', color: isDark ? '#fff' : '#181d27' }}>Key Points</h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '18px', margin: 0 }}>
            {(currentPub?.bulletPoints || []).slice(0, MAX_BULLETS).map((point, idx) => (
              <li key={idx} style={{ fontSize: '1rem', color: isDark ? '#bfc6d1' : '#414651', marginBottom: '10px' }}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SlideshowView;
