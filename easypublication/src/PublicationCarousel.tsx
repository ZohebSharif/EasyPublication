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

  const navigateToIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (publications.length > 0) {
      const newIndex = currentIndex === 0 ? publications.length - 1 : currentIndex - 1;
      navigateToIndex(newIndex);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (publications.length > 0) {
      const newIndex = currentIndex === publications.length - 1 ? 0 : currentIndex + 1;
      navigateToIndex(newIndex);
    }
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
        
        // Filter publications: show non-"General" category publications
        // If a publication was previously deleted but now has a non-General category, show it
        const activePublications = allData.filter((pub: PublicationData) => {
          // Always show publications that have a specific (non-General) category
          const hasSpecificCategory = pub.category && pub.category.toLowerCase() !== 'general';
          
          // If publication has a specific category, show it regardless of deletion history
          if (hasSpecificCategory) {
            return true;
          }
          
          // If publication is still in General category, check if it was deleted
          return !deletedIds.includes(pub.id);
        });
        
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
      // Find the publication being deleted
      const publicationToDelete = publications.find(pub => pub.id === publicationId);
      if (!publicationToDelete) {
        throw new Error('Publication not found');
      }

      // Reset the publication's category back to "General" and clear images
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
          // Remove from deleted list since it's now properly reset to General
          const deletedIds = JSON.parse(localStorage.getItem('deletedPublications') || '[]');
          const updatedDeletedIds = deletedIds.filter((id: number) => id !== publicationId);
          localStorage.setItem('deletedPublications', JSON.stringify(updatedDeletedIds));
        }
      } catch (serverError) {
        // If server is not available, just remove from view
      }
      
      // Remove from local state
      const updatedPublications = publications.filter(pub => pub.id !== publicationId);
      setPublications(updatedPublications);
      
      // Add to deleted publications list in localStorage
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
      
    } catch (error) {
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
    <div className="Carousel" style={{ 
      position: 'relative', 
      paddingTop: '2vw', 
      paddingBottom: '6vw',
      maxWidth: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Category Label */}
      <div className="carousel-category-label" style={{
        marginBottom: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {category.toUpperCase()}
      </div>
      
      {/* Publication cards */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
          minHeight: '700px',
          position: 'relative',
          overflow: 'visible',
          width: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          paddingTop: '40px',
          paddingBottom: '40px'
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
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent click if we just finished dragging
            if (hasDragged) {
              return;
            }
            
            // Navigate directly to this index if it's not the active card
            if (!isActive) {
              navigateToIndex(index);
            }
          };
          
          // Calculate position with drag offset
          const baseTransform = offset * 600; // Space between cards
          const dragTransform = isDragging ? dragOffset : 0;
          const totalTransform = baseTransform + dragTransform;
          
          // Show all cards but with different opacity levels
          let opacity = isActive ? 1 : 0.6; // Make inactive cards more visible
          let scale = isActive ? 1.1 : 0.85; // Increase scale difference
          
          return (
            <div
              key={publication.id}
              data-is-active={isActive}
              onClick={isActive ? undefined : handleCardClick}
              style={{
                position: 'absolute',
                left: '50%',
                transform: `translateX(calc(-50% + ${totalTransform}px)) scale(${scale})`,
                opacity: opacity,
                transition: isDragging ? 'transform 0.1s ease-out' : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: isActive ? 10 : Math.max(1, 10 - Math.abs(offset)),
                filter: isActive && !isDragging ? 'drop-shadow(0 15px 30px rgba(0,0,0,0.2))' : 'none', // Enhanced shadow
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

      {/* Navigation and Title Unit */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        marginTop: '-115px',  // Decreased from -130px by 15px
        backgroundColor: 'transparent',
        padding: '0',
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Navigation Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginTop: '-45px'  // Decreased from -60px by 15px
        }}>
          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrevious}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '8px',
              border: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            <img 
              src={LeftArrow} 
              alt="Previous"
              style={{
                width: '25px',
                height: '25px',
                opacity: 0.8,
                pointerEvents: 'none'
              }}
            />
          </button>

          {/* Publication Counter */}
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: 500,
            minWidth: '80px',
            textAlign: 'center'
          }}>
            {currentIndex + 1} of {publications.length}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '8px',
              border: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            <img 
              src={RightArrow} 
              alt="Next"
              style={{
                width: '25px',
                height: '25px',
                opacity: 0.8,
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicationCarousel;
