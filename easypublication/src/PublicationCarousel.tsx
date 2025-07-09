import { useState, useEffect } from 'react';
import PublicationCard from './PublicationCard';

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
}

function PublicationCarousel() {
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="Carousel">
      {publications.map((publication) => (
        <PublicationCard 
          key={publication.id} 
          publication={publication} 
        />
      ))}
    </div>
  );
}

export default PublicationCarousel;
