import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const loadPublications = async () => {
      try {
        // Try both paths
        let response = await fetch('/data/all-publications.json');
        if (!response.ok) {
          response = await fetch('/public/data/all-publications.json');
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const filtered = data.filter((pub: Publication) => {
          if (!pub.images) return false;
          
          // Handle both string and array formats
          const images = typeof pub.images === 'string' ? JSON.parse(pub.images) : pub.images;
          return images && images.length > 0;
        }).map((pub: Publication) => ({
          ...pub,
          // Ensure images is always an array
          images: typeof pub.images === 'string' ? JSON.parse(pub.images) : pub.images
        }));
        
        setPublications(filtered);
      } catch (error) {
        console.error('Error loading publications:', error);
      }
    };

    loadPublications();
  }, []);

  useEffect(() => {
    setImageIndex(0);
  }, [currentIndex]);

  const currentPub = publications[currentIndex];

  const handlePrev = () => {
    if (publications.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : publications.length - 1;
    setCurrentIndex(newIndex);
  };
  const handleNext = () => {
    if (publications.length === 0) return;
    const newIndex = currentIndex < publications.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
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
    <div style={{ 
      overflow: 'hidden', 
      height: '100vh', 
      background: isDark ? '#181d27' : '#fff', 
      color: isDark ? '#fff' : '#181d27',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      {/* Header with Title and View Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px', 
        position: 'relative' 
      }}>
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
        }}>
          {currentPub?.title || '3D Data Visual'}
        </h1>

        <div style={{ position: 'absolute', left: '20px', zIndex: 2 }}>
          <button onClick={handleWebView} style={{ 
            background: isDark ? '#181d27' : '#fff', 
            color: isDark ? '#fff' : '#181d27', 
            border: isDark ? '2px solid #fff' : '2px solid #181d27', 
            fontWeight: 700, 
            fontFamily: 'Inter, Arial, sans-serif',
            minWidth: 'fit-content',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '8px'
          }}>
            Web View
          </button>
          <button onClick={handleSlideshowView} style={{ 
            background: isDark ? '#fff' : '#181d27', 
            color: isDark ? '#181d27' : '#fff', 
            border: isDark ? '2px solid #fff' : '2px solid #181d27', 
            fontWeight: 700, 
            fontFamily: 'Inter, Arial, sans-serif',
            minWidth: 'fit-content',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Slideshow View
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
        gap: '24px',
        padding: '0 24px',
        marginTop: '-5px',
        height: 'calc(100vh - 140px)'
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
          zIndex: 10,
          padding: '8px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#181d27'} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,8 8,12 12,16"/>
            <line x1="16" y1="12" x2="8" y2="12"/>
          </svg>
        </button>
        
        <button onClick={handleNext} style={{
          position: 'absolute',
          right: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10,
          padding: '8px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#181d27'} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,8 16,12 12,16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </button>

        {/* Main Content Box */}
        <div style={{
          background: isDark ? '#181d27' : 'white', 
          color: isDark ? '#fff' : '#181d27', 
          borderRadius: '18px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
          width: '800px',
          maxWidth: '65vw', 
          height: 'fit-content',
          maxHeight: '100%',
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '32px', 
          fontSize: '1rem'
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
              padding: '0',
              lineHeight: '1'
            }}>
              ×
            </button>
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

          {/* Image Section */}
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            marginBottom: '24px'
          }}>
            {/* Main Image */}
            <div style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '400px', 
              height: '400px',
              marginBottom: '16px'
            }}>
              {currentPub?.images && currentPub.images.length > 0 && (
                <img 
                  src={currentPub.images[imageIndex]} 
                  alt={`Figure ${imageIndex + 1}`} 
                  style={{ 
                    height: '100%', 
                    maxHeight: '400px', 
                    maxWidth: '100%', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                    objectFit: 'contain' 
                  }} 
                />
              )}
            </div>
            
            {/* Image Controls Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '8px'
            }}>
              {/* Figure Number */}
              <div style={{ 
                fontWeight: 600, 
                fontSize: '1.1rem', 
                color: isDark ? '#fff' : '#181d27', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                background: isDark ? '#23283a' : '#f5f5f5', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {currentPub?.images && currentPub.images.length > 0 ? `Figure ${imageIndex + 1} of ${currentPub.images.length}` : ''}
              </div>
              
              {/* Image Navigation Arrows */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center'
              }}>
                <button onClick={handleImagePrev} style={{ 
                  background: isDark ? '#23283a' : '#f5f5f5', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#181d27'} strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <button onClick={handleImageNext} style={{ 
                  background: isDark ? '#23283a' : '#f5f5f5', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#181d27'} strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div style={{ 
            marginBottom: '24px',
            color: isDark ? '#bfc6d1' : '#414651', 
            fontSize: '1rem', 
            textAlign: 'left',
            lineHeight: '1.5',
            flexGrow: 1
          }}>
            {currentPub?.abstract || 'No abstract available.'}
          </div>

          {/* Bottom Row: Logos */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end',
            marginTop: 'auto'
          }}>
            {/* Logos */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {currentPub?.logos?.slice(0, MAX_LOGOS).map((logo, idx) => (
                <img 
                  key={idx} 
                  src={logo} 
                  alt={`Logo ${idx + 1}`} 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    objectFit: 'contain', 
                    borderRadius: '6px', 
                    background: '#f5f5f5', 
                    border: '1px solid #eee',
                    padding: '4px'
                  }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* QR Code - Fixed to bottom right of screen */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '80px',
          height: '80px',
          background: isDark ? '#23283a' : '#f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px dashed ${isDark ? '#3a4553' : '#d1d5db'}`,
          zIndex: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#bfc6d1' : '#6b7280'} strokeWidth="1.5">
            <rect x="3" y="3" width="5" height="5"/>
            <rect x="16" y="3" width="5" height="5"/>
            <rect x="3" y="16" width="5" height="5"/>
            <path d="m21 16-3.5-3.5-2.5 2.5"/>
            <path d="m8 11 2 2 4.5-4.5"/>
          </svg>
        </div>

        {/* Right: Bullet Points */}
        <div style={{
          background: isDark ? '#181d27' : 'white', 
          color: isDark ? '#fff' : '#181d27', 
          borderRadius: '18px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
          width: '280px',
          maxWidth: '25vw', 
          height: 'fit-content',
          maxHeight: '100%',
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            fontWeight: 600, 
            fontSize: '1.2rem', 
            marginBottom: '20px', 
            color: isDark ? '#fff' : '#181d27',
            marginTop: 0
          }}>
            Key Points
          </h3>
          <ul style={{ 
            listStyle: 'disc', 
            paddingLeft: '18px', 
            margin: 0,
            lineHeight: '1.6'
          }}>
            {(currentPub?.bulletPoints || []).slice(0, MAX_BULLETS).map((point, idx) => (
              <li key={idx} style={{ 
                fontSize: '1rem', 
                color: isDark ? '#bfc6d1' : '#414651', 
                marginBottom: '12px'
              }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SlideshowView;