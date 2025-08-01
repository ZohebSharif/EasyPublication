import styles from './Card.module.css';
import BerkeleyLabLogo from './assets/lblLogo.png';
import { useNavigate } from 'react-router-dom';
interface Publication {
  id: number;
  title: string;
  authors: string;
  online_pub_date: string;
  doi: string;
  beamlines: string;
  year: string;
  high_impact: number;
  category?: string;
  tags?: string;
  images?: string | string[];
  abstract?: string;
  key_points?: string[];
}

interface PublicationCardProps {
  publication: Publication;
  isAdminMode?: boolean;
  onDelete?: (publicationId: number) => void;
}

function PublicationCard({ publication, isAdminMode = false, onDelete }: PublicationCardProps) {
  const navigate = useNavigate();
  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to get images array
  const getImages = (imagesJson: string | string[] | undefined) => {
    if (!imagesJson) return [];
    
    // If it's already an array (from JSON parsing), return it
    if (Array.isArray(imagesJson)) {
      return imagesJson;
    }
    
    // If it's a string (from database), parse it
    try {
      const parsed = JSON.parse(imagesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Helper function to get the first (primary) image URL
  const getPrimaryImageUrl = (imagesJson: string | string[] | undefined): string | null => {
    const images = getImages(imagesJson);
    if (images.length === 0) return null;
    
    const firstImage = images[0];
    
    // Cloudinary URLs (already full URLs)
    if (firstImage.startsWith('https://res.cloudinary.com/')) {
      return firstImage;
    }
    
    // Other full URLs
    if (firstImage.startsWith('http')) {
      return firstImage;
    }
    
    // Legacy local server paths
    if (firstImage.startsWith('/images/')) {
      return `http://localhost:3001${firstImage}`;
    }
    
    // Fallback - return the path as-is
    return firstImage;
  };

  // Helper function to format DOI link
  const getDoiLink = (doi: string) => {
    if (!doi) return '#';
    return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardWrapper}>
        
        {/* Delete button for admin mode */}
        {isAdminMode && onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm(`Remove "${publication.title}" from this category?\n\nThis will reset the publication's category back to "General" in the database.`)) {
                onDelete(publication.id);
              }
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#cc0000';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={`Remove "${publication.title}"`}
          >
            ×
          </button>
        )}
        
        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            {/* Display Logo (currently its Berkeley Lab as a placeholder*/}
            <img 
              src={BerkeleyLabLogo} 
              alt="Berkeley Lab Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {truncateText(publication.title, 50)}
            </div>
            <div className={styles.userRole}>
              {publication.year}{publication.high_impact ? ' - High Impact' : ''}
            </div>
          </div>
        </div>

        {/* Image Section - Display first uploaded image from database */}
        <div className={styles.imageSection} style={{ position: 'relative' }}>
          {/* Slideshow button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/slideshow', { state: { initialPublication: publication } });
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(128, 128, 128, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              zIndex: 10,
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(2px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.9)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.cursor = 'zoom-in';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.cursor = 'pointer';
            }}
            title="Open in slideshow view"
          >
            Open in Slideshow
          </button>

          {(() => {
            const primaryImageUrl = getPrimaryImageUrl(publication.images);
            if (primaryImageUrl) {
              return (
                <img 
                  src={primaryImageUrl} 
                  alt="Publication visual"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to a generic placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div style="
                        width: 100%; 
                        height: 100%; 
                        backgroundColor: #f0f0f0;
                        display: flex;
                        alignItems: center;
                        justifyContent: center;
                        fontSize: 12px;
                        color: #666;
                        textAlign: center;
                        padding: 10px;
                      ">
                        ${publication.title || 'Publication'}
                      </div>
                    `;
                  }}
                />
              );
            } else {
              return (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  padding: '10px'
                }}>
                  {publication.title || 'Publication'}
                </div>
              );
            }
          })()}
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <div className={styles.titleSection}>
            
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',  // Changed from space-between to flex-end
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: '#666',
                  marginTop: '8px'
                }}>
                  {publication.online_pub_date !== '00/00/00' && (
                    <div style={{ marginRight: 'auto' }}>Published: {publication.online_pub_date}</div>
                  )}
                  <div>DOI: {publication.doi}</div>
                </div>
              </div>

              {/* Abstract */}
              <div style={{
                padding: '20px',
                paddingTop: '12px'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#414651',
                  lineHeight: '1.5',
                  maxHeight: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,  // Changed from 4 to 3
                  WebkitBoxOrient: 'vertical'
                }}>
                  <strong>Abstract: </strong>
                  <span style={{ fontStyle: 'italic' }}>
                    {publication.abstract || 'No abstract available.'}
                  </span>
                </div>

                {/* Authors (truncated) */}
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '16px',
                  lineHeight: '1.4'
                }}>
                  <strong>Authors:</strong> {truncateText(publication.authors, 100)}
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <div className={styles.tag}>
                <a 
                  href={getDoiLink(publication.doi)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.tagText}>
                    {publication.doi ? 'View DOI' : 'View'}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicationCard;
