import { useState, useEffect, useRef } from 'react';
import SearchIcon from './assets/search.svg?react';

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

interface SearchResult {
  publication: PublicationData;
  matchType: 'doi' | 'title' | 'authors' | 'journal';
}

export default function LiveSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Load publications data
  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch('/data/all-publications.json');
        if (!response.ok) {
          throw new Error('Failed to load publications data');
        }
        const data = await response.json();
        setPublications(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load publications');
      }
    };

    loadPublications();
  }, []);

  // Search publications as user types
  useEffect(() => {
    if (!searchTerm.trim() || publications.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    publications.forEach(pub => {
      let matchType: 'doi' | 'title' | 'authors' | 'journal' | null = null;

      // Check DOI first (highest priority)
      if (pub.doi && pub.doi.toLowerCase().includes(searchLower)) {
        matchType = 'doi';
      }
      // Check title
      else if (pub.title && pub.title.toLowerCase().includes(searchLower)) {
        matchType = 'title';
      }
      // Check authors
      else if (pub.authors && pub.authors.toLowerCase().includes(searchLower)) {
        matchType = 'authors';
      }
      // Check journal
      else if (pub.journal && pub.journal.toLowerCase().includes(searchLower)) {
        matchType = 'journal';
      }

      if (matchType) {
        results.push({ publication: pub, matchType });
      }
    });

    // Sort results: DOI matches first, then by year (newest first)
    results.sort((a, b) => {
      if (a.matchType === 'doi' && b.matchType !== 'doi') return -1;
      if (b.matchType === 'doi' && a.matchType !== 'doi') return 1;
      return parseInt(b.publication.year) - parseInt(a.publication.year);
    });

    setSearchResults(results.slice(0, 4)); // Top 4 results
    setShowResults(true);
    setLoading(false);
  }, [searchTerm, publications]);

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (publication: PublicationData) => {
    if (publication.doi) {
      const doiUrl = publication.doi.startsWith('http') 
        ? publication.doi 
        : `https://doi.org/${publication.doi}`;
      window.open(doiUrl, '_blank');
    }
    setShowResults(false);
    setSearchTerm('');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getMatchTypeDisplay = (matchType: string) => {
    switch (matchType) {
      case 'doi': return '🔗 DOI';
      case 'title': return '📄 Title';
      case 'authors': return '👥 Author';
      case 'journal': return '📖 Journal';
      default: return '';
    }
  };

  return (
    <div className="searchbox" ref={searchRef}>
      <input 
        className="inputBox" 
        placeholder=" Search DOI, title, author, or journal"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowResults(searchTerm.trim() !== '')}
      />
      <SearchIcon style={{ fill: '#00313c', width: '20px', height: '20px' }} />
      
      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-result-item loading">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(({ publication, matchType }) => (
              <div 
                key={publication.id}
                className="search-result-item"
                onClick={() => handleResultClick(publication)}
              >
                <div className="result-header">
                  <span className="match-type">{getMatchTypeDisplay(matchType)}</span>
                  <span className="result-year">{publication.year}</span>
                  {publication.high_impact === 1 && <span className="high-impact">⭐</span>}
                </div>
                <div className="result-title">
                  {truncateText(publication.title, 80)}
                </div>
                <div className="result-details">
                  <span className="result-journal">{publication.journal}</span>
                  {publication.doi && (
                    <span className="result-doi">{truncateText(publication.doi, 30)}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="search-result-item no-results">
              No publications found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
