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

interface PublicationCarouselProps {
  category: string;
}

function PublicationCarousel({ category }: PublicationCarouselProps) {
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startDragIndex, setStartDragIndex] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if the click originated from an active (centered) card
    let target = e.target as HTMLElement;
    while (target && target !== e.currentTarget) {
      if (target.dataset.isActive === 'true') {
        // Don't start dragging if clicking on the active card
        return;
      }
      target = target.parentElement as HTMLElement;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartDragIndex(currentIndex);
    setDragOffset(0);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.clientX - startX;
    setDragOffset(deltaX);
    
    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      setHasDragged(true);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Only navigate if we actually dragged
    if (hasDragged) {
      const cardWidth = 500;
      const threshold = cardWidth * 0.2;
      
      if (Math.abs(dragOffset) > threshold) {
        const direction = dragOffset > 0 ? -1 : 1;
        let newIndex = startDragIndex + direction;
        
        if (newIndex < 0) {
          newIndex = publications.length - 1;
        } else if (newIndex >= publications.length) {
          newIndex = 0;
        }
        
        setCurrentIndex(newIndex);
      }
    }
    
    setDragOffset(0);
    // Reset hasDragged after a small delay to allow click events to work
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if the touch originated from an active (centered) card
    let target = e.target as HTMLElement;
    while (target && target !== e.currentTarget) {
      if (target.dataset.isActive === 'true') {
        // Don't start dragging if touching the active card
        return;
      }
      target = target.parentElement as HTMLElement;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartDragIndex(currentIndex);
    setDragOffset(0);
    setHasDragged(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - startX;
    setDragOffset(deltaX);
    
    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(deltaX) > 5) {
      setHasDragged(true);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
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
        
        // Set default index to 1 (2nd card) if there are at least 2 publications
        if (data.length >= 2) {
          setCurrentIndex(1);
        }
        
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
    <div className="Carousel" style={{ position: 'relative', paddingTop: '2vw', paddingBottom: '6vw' }}>
      
      {/* Category Label */}
      <div className="carousel-category-label">
        {category.toUpperCase()}
      </div>
      
      {/* Publication cards */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
          minHeight: '600px',
          position: 'relative',
          overflow: 'visible',
          width: '100vw',
          cursor: isDragging ? 'grabbing' : 'grab',
          paddingTop: '50px',
          paddingBottom: '50px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {publications.map((publication, index) => {
          const isActive = index === currentIndex;
          const offset = index - currentIndex;
          
          const handleCardClick = (e: React.MouseEvent) => {
            // Prevent click if we just finished dragging
            if (hasDragged) {
              e.preventDefault();
              return;
            }
            
            // This function should only be called for non-active cards
            e.preventDefault(); // Prevent any default actions for non-active cards
            if (offset > 0) {
              // Card is to the right, call handleNext
              handleNext();
            } else if (offset < 0) {
              // Card is to the left, call handlePrevious
              handlePrevious();
            }
          };
          
          // Calculate position with drag offset
          const baseTransform = offset * 500;
          const dragTransform = isDragging ? dragOffset : 0;
          const totalTransform = baseTransform + dragTransform;
          
          // Show all cards but with different opacity levels - PRELOAD ALL CARDS
          let opacity = 1;
          if (!isActive) {
            if (Math.abs(offset) <= 1) {
              opacity = 0.6; // Adjacent cards
            } else if (Math.abs(offset) <= 2) {
              opacity = 0.3; // Next level cards
            } else {
              opacity = 0.1; // Far cards
            }
          }
          
          return (
            <div
              key={publication.id}
              data-is-active={isActive}
              onClick={isActive ? undefined : handleCardClick}
              style={{
                position: 'absolute',
                left: '50%',
                transform: `translateX(calc(-50% + ${totalTransform}px)) scale(${isActive && !isDragging ? 1.05 : 0.9})`,
                opacity: opacity,
                transition: isDragging ? 'transform 0.1s ease-out' : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: isActive ? 10 : Math.max(1, 10 - Math.abs(offset)),
                filter: isActive && !isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'none',
                cursor: isActive ? 'default' : 'pointer',
                pointerEvents: Math.abs(offset) <= 2 ? 'auto' : 'none' // Only allow interaction with nearby cards
              }}
            >
              <PublicationCard publication={publication} />
            </div>
          );
        })}
      </div>

      {/* arrows at bottom center */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: 'calc(50% + 50px)',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '40px',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center'
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
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'scale(1)';
          }}
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
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>
    </div>
  );
}

export default PublicationCarousel;
