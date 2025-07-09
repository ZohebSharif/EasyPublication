import { useState, useEffect } from 'react';
import PublicationCard from './PublicationCard';
import LeftArrow from './assets/arrow-left-circle.png';
import RightArrow from './assets/arrow-right-circle.png';

interface PublicationData {
  id: number;
  title: string;
  authors: string;
  journal: string;
  online_pub_date: string;
  doi: string;
  beamlines: string;
  year: string;
  high_impact: number;
  category?: string;
  impact_factor?: number;
  tags?: string;
  images?: string; // JSON string containing array of PNG paths
}

function PublicationCarousel() {
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? publications.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === publications.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const loadPublications = async () => {
      try {
        // Load the selected publications JSON file
        const response = await fetch('/data/selected-publications.json');
        if (!response.ok) {
          throw new Error('Failed to load publications data');
        }
        const data = await response.json();
        setPublications(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading publications...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="Carousel" style={{ position: 'relative', paddingTop: '5vw' }}>
      {/* Navigation arrows at top right */}
      <div style={{
        position: 'absolute',
        top: '2.5vw',
        right: '10vw',
        display: 'flex',
        gap: '20px',
        zIndex: 10
      }}>
        <img 
          src={LeftArrow} 
          alt="Previous"
          onClick={handlePrevious}
          style={{
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        />
        <img 
          src={RightArrow} 
          alt="Next"
          onClick={handleNext}
          style={{
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        />
      </div>
      
      {/* Publication cards */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
        width: '100vw'
      }}>
        {publications.map((publication, index) => {
          const isActive = index === currentIndex;
          const offset = index - currentIndex;
          
          return (
            <div
              key={publication.id}
              style={{
                position: 'absolute',
                left: '50%',
                transform: `translateX(calc(-50% + ${offset * 500}px)) scale(${isActive ? 1.05 : 0.9})`,
                opacity: Math.abs(offset) <= 1 ? (isActive ? 1 : 0.6) : 0,
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: isActive ? 10 : 1,
                filter: isActive ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'none'
              }}
            >
              <PublicationCard publication={publication} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PublicationCarousel;
