import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SlideshowView.module.css';
import { createApiUrl, API_ENDPOINTS } from './config';

interface Publication {
  id: number;
  title: string;
  authors: string;
  online_pub_date: string;
  doi: string;
  doi_url: string;  // Added this field
  beamlines: string;
  year: string;
  high_impact: number;
  category?: string;
  tags?: string;
  images: string[];
  abstract?: string;
  key_points?: string[];
  doi_qr_code?: string;
}

export default function SlideshowView() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPublication = location.state?.initialPublication;

  const [publications, setPublications] = useState<Publication[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const isDark = false;
  const [, setError] = useState<string | null>(null);
  const currentPub = publications[currentIndex];

  // Helper function to format DOI link - same as PublicationCard
  const getDoiLink = (doi: string) => {
    if (!doi) return '#';
    return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
  };

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        // Use API endpoint to get all publications with proper data
        let response;
        try {
          response = await fetch(createApiUrl(API_ENDPOINTS.ALL_PUBLICATIONS));
        } catch (apiError) {
          // Fallback to static file if API fails
          console.warn('API failed, falling back to static file:', apiError);
          response = await fetch('/public/data/all-publications.json');
        }
        
        if (!response.ok) {
          throw new Error('Failed to load publications');
        }
        const data = await response.json();
        
        // Filter publications with images
        const pubsWithImages = data.filter((pub: Publication) => {
          // Images come as arrays from the API
          const images = pub.images || [];
          return images.length > 0;
        });

        setPublications(pubsWithImages);

        // Set initial index if initialPublication is provided
        if (initialPublication) {
          const index = pubsWithImages.findIndex((pub: Publication) => pub.id === initialPublication.id);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchPublications();
  }, [initialPublication]);

  useEffect(() => {
    setImageIndex(0);
  }, [currentIndex]);

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

  const handleImagePrev = () => {
    if (!currentPub?.images) return;
    setImageIndex(idx => idx > 0 ? idx - 1 : currentPub.images.length - 1);
  };
  const handleImageNext = () => {
    if (!currentPub?.images) return;
    setImageIndex(idx => idx < currentPub.images.length - 1 ? idx + 1 : 0);
  };

  return (
    <div className={styles.slideshowContainer}>
      {/* Header with Title */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px 40px', 
        position: 'relative' 
      }}>
        <h1 style={{ 
          fontSize: '2.2em',
          margin: 0,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.2',
          maxHeight: '2.4em',
          textAlign: 'center'
        }}>
          {currentPub?.title || '3D Data Visual'}
        </h1>
      </div>

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'flex-start',
        gap: '20px',
        padding: '0 20px',
        marginTop: '-5px',
        height: 'calc(100vh - 120px)',
        overflow: 'hidden'
      }}>
        {/* Publication Navigation Arrows - Left and Right sides */}
        <button onClick={handlePrev} style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          padding: '20px',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        
        <button onClick={handleNext} style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          padding: '20px',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>

        {/* Left Sidebar - Publication Info */}
        <div style={{
          width: '480px',
          height: '100%',
          background: isDark ? '#181d27' : 'white',
          color: isDark ? '#fff' : '#181d27',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 10
        }}>
          {/* Header with close button and category */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '30px'
          }}>
            <button onClick={handleClose} style={{ 
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              fontSize: '20px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#000',
              padding: '8px 12px',
              lineHeight: '1',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            }}
            >
              ✕
            </button>

            <div style={{ 
              color: isDark ? '#bfc6d1' : '#414651',
              fontFamily: 'monospace',
              fontSize: '0.9em',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
            }}>
              {currentPub?.category || 'Physics and Condensed Matter'}
            </div>
          </div>

          {/* Abstract and Key Points Container */}
          <div style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            gap: '20px'
          }}>
            <div style={{
              flex: '0 0 auto'
            }}>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '1.3rem', 
                marginBottom: '16px', 
                color: isDark ? '#fff' : '#181d27',
                marginTop: 0
              }}>
                Abstract
              </h3>
              <div style={{ 
                color: isDark ? '#bfc6d1' : '#414651', 
                fontSize: '1rem', 
                textAlign: 'left',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto',
                paddingRight: '10px'
              }}>
                {currentPub?.abstract || 'No abstract available.'}
              </div>
            </div>

            {/* Key Points Section */}
            <div style={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '1.3rem', 
                marginBottom: '16px', 
                color: isDark ? '#fff' : '#181d27',
                marginTop: 0
              }}>
                Key Points
              </h3>
              <div style={{
                flex: '1 1 auto',
                overflow: 'auto',
                paddingRight: '10px'
              }}>
                <ul style={{ 
                  listStyle: 'disc', 
                  paddingLeft: '18px', 
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {(currentPub?.key_points || []).map((point, idx) => (
                    <li key={idx} style={{ 
                      fontSize: '1rem', 
                      color: isDark ? '#bfc6d1' : '#414651', 
                      marginBottom: '14px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {point}
                    </li>
                  ))}
                  {(!currentPub?.key_points || currentPub.key_points.length === 0) && (
                    <li style={{ 
                      fontSize: '1rem', 
                      color: isDark ? '#bfc6d1' : '#414651', 
                      marginBottom: '14px',
                      fontStyle: 'italic'
                    }}>
                      No key points available.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Image Area */}
        <div style={{
          flex: '1 1 auto',
          height: '100%',
          background: '#000',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}>
          {/* Image Display */}
          {currentPub?.images && currentPub.images.length > 0 && (
            <>
              <img 
                src={currentPub.images[imageIndex]}
                alt={`Publication figure ${imageIndex + 1}`}
                style={{
                  maxWidth: '95%',
                  maxHeight: '95%',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
              
              {/* Image Navigation Controls (only show if multiple images) */}
              {currentPub.images.length > 1 && (
                <>
                  {/* Previous Image Button */}
                  <button onClick={handleImagePrev} style={{
                    position: 'absolute',
                    left: '20px',
                    bottom: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 20,
                    padding: '10px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"/>
                    </svg>
                  </button>
                  
                  {/* Next Image Button */}
                  <button onClick={handleImageNext} style={{
                    position: 'absolute',
                    left: '80px',
                    bottom: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 20,
                    padding: '10px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </button>
                  
                  {/* Image Counter and Title */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    zIndex: 20,
                    fontWeight: '500'
                  }}>
                    Figure {imageIndex + 1} of {currentPub.images.length}
                  </div>
                </>
              )}

              {/* Single image indicator */}
              {currentPub.images.length === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  zIndex: 20,
                  fontWeight: '500'
                }}>
                  Figure
                </div>
              )}
            </>
          )}
          
          {/* No Image State */}
          {(!currentPub?.images || currentPub.images.length === 0) && (
            <div style={{
              color: '#666',
              fontSize: '1.2rem',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.3 }}>📊</div>
              No visualization available
            </div>
          )}
        </div>

        {/* QR Code - Bottom right corner */}
        {currentPub && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 30,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={() => {
            window.open(getDoiLink(currentPub.doi), '_blank', 'noopener,noreferrer');
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Click to view publication"
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
              textAlign: 'center'
            }}>
              View Article
            </div>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(getDoiLink(currentPub.doi))}&size=90x90`}
              alt="DOI QR Code"
              style={{
                width: '90px',
                height: '90px',
                display: 'block'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}