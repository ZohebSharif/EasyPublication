import styles from './Card.module.css';
import BerkeleyLabLogo from './assets/lblLogo.png';
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

interface PublicationCardProps {
  publication: PublicationData;
}

function PublicationCard({ publication }: PublicationCardProps) {
  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to get images array
  const getImages = (imagesJson: string | undefined) => {
    if (!imagesJson) return [];
    try {
      return JSON.parse(imagesJson);
    } catch {
      return [];
    }
  };

  // Helper function to get first author
  const getFirstAuthor = (authors: string) => {
    if (!authors) return 'Unknown Author';
    const firstAuthor = authors.split(',')[0];
    return firstAuthor.trim();
  };

  // Helper function to format DOI link
  const getDoiLink = (doi: string) => {
    if (!doi) return '#';
    return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardWrapper}>
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
              {getFirstAuthor(publication.journal)}
            </div>
            <div className={styles.userRole}>
              {publication.year} {publication.high_impact ? '- High Impact' : ''}
            </div>
          </div>
        </div>

        {/* Image Section - could add journal logo or placeholder */}
        <div className={styles.imageSection}>
          {(() => {
            const images = getImages(publication.images);
            if (images.length > 0) {
              return (
                <img 
                  src={images[0]} 
                  alt="Publication visual"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to journal name if image fails to load
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
                        ${publication.journal}
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
                  {publication.journal}
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
                <div className={styles.title}>
                  {truncateText(publication.title, 60)}
                </div>
                <div className={styles.subtitle}>
                  Published: {publication.online_pub_date}
                </div>
              </div>
              <div className={styles.description}>
                <strong>Authors:</strong> {truncateText(publication.authors, 100)}
                <br />
                <strong>Journal:</strong> {publication.journal}
                <br />
                <strong>Beamline:</strong> {publication.beamlines}
                {(() => {
                  const images = getImages(publication.images);
                  if (images.length > 1) {
                    return (
                      <>
                        <br />
                        <strong>Images:</strong> {images.length} available
                      </>
                    );
                  }
                  return null;
                })()}
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
