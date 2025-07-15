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
  images?: string | string[]; // Can be JSON string (from database) or array (from parsed JSON)
}

interface PublicationCarouselProps {
  category: string;
  isAdminMode?: boolean;
}

function PublicationCarousel({ category, isAdminMode = false }: PublicationCarouselProps) {
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
        // Load all publications from the database and filter by tags/category
        const response = await fetch('/data/all-publications.json');
        if (!response.ok) {
          throw new Error('Failed to load publications data');
        }
        const allData = await response.json();
        
        // Get list of deleted publications from localStorage
        const deletedIds = JSON.parse(localStorage.getItem('deletedPublications') || '[]');
        
        // Filter out deleted publications and only show non-"General" category publications
        const activePublications = allData.filter((pub: PublicationData) => 
          !deletedIds.includes(pub.id) && pub.category && pub.category.toLowerCase() !== 'general'
        );
        
        // Map category names to match the selected category
        const categoryToMatch: { [key: string]: string } = {
          'chemistry and energy': 'chemistry and energy',
          'physics and condensed matter': 'physics and condensed matter',
          'bioscience': 'bioscience',
          'geoscience and environment': 'geoscience and environment'
        };
        
        const targetCategory = categoryToMatch[category] || category;
        
        // Filter publications that match the specific category
        const filteredPublications = activePublications.filter((pub: PublicationData) => {
          // Match publications by category (case-insensitive)
          return pub.category && 
                 pub.category.toLowerCase() === targetCategory.toLowerCase();
        });
        
        // Sort by year (newest first) and then by title
        filteredPublications.sort((a: PublicationData, b: PublicationData) => {
          const yearDiff = parseInt(b.year) - parseInt(a.year);
          if (yearDiff !== 0) return yearDiff;
          return a.title.localeCompare(b.title);
        });
        
        setPublications(filteredPublications);
        
        // Set default index to 1 (2nd card) if there are at least 2 publications
        if (filteredPublications.length >= 2) {
          setCurrentIndex(1);
        } else if (filteredPublications.length === 1) {
          setCurrentIndex(0);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadPublications();
  }, [category]); // Re-load when category changes

  // Handler for deleting publications in admin mode
  const handleDeletePublication = async (publicationId: number) => {
    try {
      // Find the publication being deleted to get its title for the API call
      const publicationToDelete = publications.find(pub => pub.id === publicationId);
      if (!publicationToDelete) {
        console.error('Publication not found');
        return;
      }

      // Reset the publication's category back to "General" and clear images in the database
      console.log(`🔄 Resetting publication ${publicationId} category to "General" and clearing images`);
      
      try {
        const resetResponse = await fetch('http://localhost:3001/api/update-publication', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: publicationToDelete.title,
            authors: publicationToDelete.authors,
            category: 'General',
            imagePaths: [] // Reset images to empty array
          })
        });

        if (resetResponse.ok) {
          const result = await resetResponse.json();
          console.log(`✅ Publication category reset to General and images cleared:`, result);
        } else {
          const error = await resetResponse.json();
          console.warn(`⚠️ Failed to reset category and images in database: ${error.error}`);
        }
      } catch (serverError) {
        console.warn('⚠️ Server not available - publication will be removed from view only:', serverError);
      }
      
      // Remove from local state
      const updatedPublications = publications.filter(pub => pub.id !== publicationId);
      setPublications(updatedPublications);
      
      // Add to deleted publications list in localStorage (for display purposes)
      const deletedIds = JSON.parse(localStorage.getItem('deletedPublications') || '[]');
      if (!deletedIds.includes(publicationId)) {
        deletedIds.push(publicationId);
        localStorage.setItem('deletedPublications', JSON.stringify(deletedIds));
      }
      
      // Remove from localStorage if it's an admin-added publication
      const adminPubs = JSON.parse(localStorage.getItem('adminAddedPublications') || '[]');
      const newAdminPubs = adminPubs.filter((pub: any) => pub.id !== publicationId);
      localStorage.setItem('adminAddedPublications', JSON.stringify(newAdminPubs));
      
      // Adjust currentIndex if necessary
      if (currentIndex >= updatedPublications.length && updatedPublications.length > 0) {
        setCurrentIndex(updatedPublications.length - 1);
      } else if (updatedPublications.length === 0) {
        setCurrentIndex(0);
      }
      
      console.log(`📋 Publication "${publicationToDelete.title}" removed from ${category} category, reset to General, and images cleared`);
      
    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Error deleting publication. Please try again.');
    }
  };

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

  if (publications.length === 0) {
    return (
      <div className="Carousel" style={{ position: 'relative', paddingTop: '2vw', paddingBottom: '6vw' }}>
        {/* Category Label */}
        <div className="carousel-category-label">
          {category.toUpperCase()}
        </div>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          width: '100%',
          textAlign: 'center',
          color: '#666',
          flexDirection: 'column',
          gap: '20px',
          padding: '0 20px'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
          }}>
            No publications available
          </div>
          <div style={{ 
            fontSize: '16px', 
            maxWidth: '500px',
            lineHeight: '1.5',
            color: '#666'
          }}>
            Publications will appear here once they are uploaded and tagged with "{category.toLowerCase()}" category.
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontStyle: 'italic',
            color: '#888',
            marginTop: '10px'
          }}>
            Use the Admin interface to add new publications to this category.
          </div>
        </div>
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
              <PublicationCard 
                publication={publication} 
                isAdminMode={isAdminMode}
                onDelete={isAdminMode ? handleDeletePublication : undefined}
              />
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
