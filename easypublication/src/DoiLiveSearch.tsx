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

interface DoiSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPublication?: (publication: PublicationData) => void;
}

function DoiLiveSearch({ value, onChange, onSelectPublication }: DoiSearchProps) {
  const [publications, setPublications] = useState<PublicationData[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    if (!value.trim() || publications.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const searchLower = value.toLowerCase();
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
  }, [value, publications]);

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
    onChange(e.target.value);
  };

  const handleResultClick = (publication: PublicationData) => {
    onChange(publication.doi || '');
    setShowResults(false);
    if (onSelectPublication) {
      onSelectPublication(publication);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getMatchTypeDisplay = (matchType: string) => {
    switch (matchType) {
      case 'doi': return '🔗';
      case 'title': return '📄';
      case 'authors': return '👥';
      case 'journal': return '📖';
      default: return '';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={searchRef}>
      <input
        type="text"
        placeholder="Enter the DOI here"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowResults(value.trim() !== '')}
        style={{
          width: '100%',
          padding: '6px 25px 6px 8px',
          border: '1px solid #e0e0e0',
          borderRadius: '5px',
          fontSize: '12px',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
      />
      <SearchIcon style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '14px',
        height: '14px',
        fill: '#666',
        pointerEvents: 'none'
      }} />
      
      {showResults && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e0e0e0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {loading ? (
            <div style={{
              padding: '12px',
              textAlign: 'center',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(({ publication, matchType }) => (
              <div 
                key={publication.id}
                onClick={() => handleResultClick(publication)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '3px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    {getMatchTypeDisplay(matchType)} {matchType.toUpperCase()}
                  </span>
                  <div>
                    <span style={{
                      fontSize: '10px',
                      color: '#00313c',
                      fontWeight: 'bold'
                    }}>
                      {publication.year}
                    </span>
                    {publication.high_impact === 1 && (
                      <span style={{ fontSize: '12px', marginLeft: '4px' }}>⭐</span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontWeight: '600',
                  color: '#00313c',
                  marginBottom: '3px',
                  lineHeight: '1.2',
                  fontSize: '11px'
                }}>
                  {truncateText(publication.title, 60)}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  <span style={{ fontWeight: '500' }}>
                    {truncateText(publication.journal, 25)}
                  </span>
                  {publication.doi && (
                    <span style={{
                      fontFamily: 'monospace',
                      color: '#0066cc'
                    }}>
                      {truncateText(publication.doi, 20)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '12px',
              textAlign: 'center',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              No publications found matching "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoiLiveSearch;
