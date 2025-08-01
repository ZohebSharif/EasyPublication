import "./App.css";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BerkeleyLabLogo from './assets/berkeley-lab-logo.svg';
import DoeLogo from './assets/doe-logo.svg';
import UcLogo from './assets/uc-logo.svg';
import AddButton from './assets/add-button.png';
import FacebookIcon from './assets/facebook.svg?react';
import InstagramIcon from './assets/instagram.svg?react';
import XIcon from './assets/x.svg?react';
import SearchIcon from './assets/search.svg?react';
import YoutubeIcon from './assets/youtube.svg?react';
import EmailIcon from './assets/email.svg?react';
import LinkedinIcon from './assets/linkedin.svg?react';
import PublicationCarousel from "./PublicationCarousel";
import DoiLiveSearch from "./DoiLiveSearch";

 const categories = [
    "chemistry and energy",
    "physics and condensed matter", 
    "bioscience",
    "geoscience and environment"
  ];
  
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

interface Publication {
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
}

function Admin() {
  const currentBeamline = 'Beamline 8.3.2'
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // Keep this since it's used
  const [groqApiKey, setGroqApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);  // Add error state setter
  
  // Form state
  const [formData, setFormData] = useState({
    doi: '',
    title: '',
    abstract: '',
    keyPoints: [] as string[],
    authors: '',
    categories: '', // Which category carousel to display this publication in
    files: [] as File[]
  });
  const [dragActive, setDragActive] = useState(false);

  // Load OpenAI API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/groq-key');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const data = await response.json();
        setGroqApiKey(data.key);
      } catch (error) {
        setApiKeyError(error instanceof Error ? error.message : 'Failed to load API key');
      }
    };
    loadApiKey();
  }, []);

  const handleBackToUserView = () => {
    navigate('/');
  };

  const handleAddButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form data when closing
    setFormData({
      doi: '',
      title: '',
      abstract: '',
      keyPoints: [],
      authors: '',
      categories: '', // Reset category selection
      files: []
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const getFileType = (file: File): 'image' | 'pdf' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const getFilePreviewUrl = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };
  const generateGroqContent = async (doi: string, title: string, authors: string) => {
    if (!groqApiKey) {
      setApiKeyError('GROQ API key not available');
      return null;
    }
  
    try {
      setIsLoading(true);
  
      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'system',
            content: 'You are a scientific publication assistant specializing in engaging research summaries. Create concise abstracts that subtly hook readers by highlighting the research\'s significance or real-world impact, while maintaining academic tone. Keep abstracts under 430 characters.'
          }, {
            role: 'user',
            content: `Write an engaging abstract and key points for this publication:
      DOI: ${doi}
      Title: ${title}
      Authors: ${authors}
      
      Return ONLY a JSON object with these exact fields:
      {
        "abstract": "A concise, engaging summary that subtly hooks readers (max 430 chars)",
        "keyPoints": ["Point 1", "Point 2", "Point 3"]
      }`
          }],
          temperature: 0.4,  // Slightly increased for more engaging language
          max_tokens: 1024
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GROQ API error: ${errorText}`);
      }
  
      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content;
      
      if (!messageContent) {
        throw new Error('No content in GROQ response');
      }

      const content = JSON.parse(messageContent);
      if (!content.abstract || !content.keyPoints) {
        throw new Error('Invalid content format in GROQ response');
      }
  
      return content;
    } catch (e) {
      if (e instanceof Error) {
        setApiKeyError(e.message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  

  const handlePublicationSelect = async (publication: Publication) => {
    
    // First update basic info
    setFormData(prev => ({
      ...prev,
      doi: publication.doi,
      title: publication.title,
      authors: publication.authors,
      // Clear existing content while loading
      abstract: '',
      keyPoints: []
    }));

    // Generate content using GROQ
    const content = await generateGroqContent(
      publication.doi,
      publication.title,
      publication.authors
    );

    if (content) {
      setFormData(prev => ({
        ...prev,
        abstract: content.abstract,
        keyPoints: content.keyPoints
      }));

      // Automatically update the publication in the database with the generated content
      try {
        const updateResponse = await fetch('http://localhost:3001/api/update-publication', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: publication.title,
            authors: publication.authors,
            category: publication.category || 'General',
            abstract: content.abstract,
            keyPoints: content.keyPoints
          })
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to save generated content');
        }
      } catch (error) {
        setApiKeyError(error instanceof Error ? error.message : 'Failed to save content');
      }
    }
  };

  // Function to upload files to the server
  const uploadFilesToServer = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.files.map((file: any) => file.path);
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : 'Upload failed');
      return [];
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title for the publication.');
      return;
    }
    if (!formData.abstract.trim()) {
      alert('Please enter an abstract for the publication.');
      return;
    }
    if (!formData.authors.trim()) {
      alert('Please enter the author(s) for the publication.');
      return;
    }
    if (!formData.categories.trim()) {
      alert('Please select which category carousel should display this publication.');
      return;
    }

    try {
      // Upload files to server and get their paths
      let imagePaths: string[] = [];
      try {
        imagePaths = await uploadFilesToServer(formData.files);
      } catch (error) {
        setApiKeyError(error instanceof Error ? error.message : 'File upload failed');
        return;
      }

      // Update publication in database automatically via server API
      const updateResponse = await fetch('http://localhost:3001/api/update-publication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          authors: formData.authors.trim(),
          category: formData.categories,
          imagePaths: imagePaths,
          abstract: formData.abstract.trim(),
          keyPoints: formData.keyPoints.filter(point => point.trim())
        })
      });

      if (updateResponse.ok) {
        await updateResponse.json();
        alert(`🎉 Success! Publication has been assigned to the "${formData.categories}" category and will appear in the carousel immediately. The page will refresh to show the changes.`);
        
        // Refresh the page to show updated publications
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        const error = await updateResponse.json();
        alert(`❌ Update failed: ${error.error}`);
        return;
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
          setFormData({
      doi: '',
      title: '',
      abstract: '',
      keyPoints: [],
      authors: '',
      categories: '',
      files: []
    });

    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : 'Error processing publication');
      
      // Check if server is running
      try {
        const healthCheck = await fetch('http://localhost:3001/api/health');
        if (!healthCheck.ok) {
          throw new Error('Server not responding');
        }
      } catch (serverError) {
        alert('❌ Error: The server is not running. Please start the server with "npm run server" in a terminal, then try again.');
        return;
      }
      
      alert('❌ Error processing publication. Please try again.');
    }
  };
  
  return (
    <div className="App">
      <div className="AppTopHeader">
        <img src={BerkeleyLabLogo} alt="logo" style={{ filter: 'brightness(0) invert(1)' }} className="headerImage"></img>
      </div>
      
      <div className="header">
        <div className="searchbox" >
          <input className="inputBox" placeholder=" Search" ></input>
          <SearchIcon style={{ fill: '#00313c', width: '20px', height: '20px' }} />
        </div>

        <div className="headerLinks">
            <strong>
                <a href="https://als.lbl.gov/" style={{ textDecoration: 'none' }}>ALS</a>
            </strong>
            <strong>
                <a href="https://als.lbl.gov/beamlines/" style={{ textDecoration: 'none' }}>Beamlines</a>
            </strong>
            <strong>
                <a href="https://als.lbl.gov/beamlines/" style={{ textDecoration: 'none' }}>{currentBeamline}</a>
            </strong>
        </div>

        <div className="buttonContainer">
        <button className="buttonOne">
           <div className="textOne">
            <strong>Web View</strong>
            </div>
          </button>

         <button className="buttonTwo">
          <div className="textTwo">
            <strong>Slideshow View</strong>
          </div>
         </button>

         {/* Add Button */}
         <button 
           onClick={handleAddButtonClick}
           style={{
             background: 'none',
             border: 'none',
             padding: '0',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             transition: 'transform 0.2s ease'
           }}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'scale(1.1)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'scale(1)';
           }}
         >
           <img 
             src={AddButton} 
             alt="Add Publication" 
             style={{ 
               width: '40px', 
               height: '40px' 
             }} 
           />
         </button>

         <div className="selected">
           <p style = {{color:"#676767"}}>Selected:</p>
           <u style = {{color:"#676767"}}>{currentBeamline}</u>
         </div>
       </div>
      </div>

      {/* Back to User View Button */}
      <div style={{
        position: 'relative',
        width: '100%',
        padding: '15px 0 10px 2vw',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#00313c',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: '"ATF Franklin Gothic", sans-serif',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFCB70';
          e.currentTarget.style.color = '#00313c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#00313c';
          e.currentTarget.style.color = 'white';
        }}
        onClick={handleBackToUserView}
        >
          <span style={{ fontSize: '16px' }}>←</span>
          Back to User View
        </button>
      </div>
      
      <div className="Body">
        <PublicationCarousel category={categories[0]} isAdminMode={true}/>
        <PublicationCarousel category={categories[1]} isAdminMode={true}/>
        <PublicationCarousel category={categories[2]} isAdminMode={true}/>
        <PublicationCarousel category={categories[3]} isAdminMode={true}/>
        <div style={{ paddingTop: '20px' }}></div>

        <div className="Footer">
          <div className="footer-main">
            <div className="footer-content">
              <div className="footer-section">
                <h1>EASY PUBLICATION</h1>
                <h2>Berkeley Lab Publishing Platform</h2>
              </div>

              <div className="footer-section">
                <h2>Platform</h2>
                <div className="footer-links">
                  <p>Features</p>
                  <p>Templates</p>
                  <p>About Us</p>
                  <p><a href="https://login.lbl.gov/idp/profile/SAML2/Redirect/SSO?execution=e1s2">Admin Login</a></p>
                </div>
              </div>

              <div className="footer-section">
                <h2>Resources</h2>
                <div className="footer-links">
                  <p>A-Z Index</p>
                  <p>CSA Staff Login</p>
                  <p>Report a Bug</p>
                </div>
              </div>

              <div className="footer-section">
                <h2>Connect</h2>
                <div className="social-icons">
                  <div className="social-icon">
                    <a href="https://www.facebook.com/BerkeleyLab" target="_blank" rel="noopener noreferrer">
                      <FacebookIcon />
                    </a>
                  </div>
                  <div className="social-icon">
                    <a href="https://www.instagram.com/berkeleylab/" target="_blank" rel="noopener noreferrer">
                      <InstagramIcon />
                    </a>
                  </div>
                  <div className="social-icon">
                    <a href="https://x.com/BerkeleyLab" target="_blank" rel="noopener noreferrer">
                      <XIcon />
                    </a>
                  </div>
                  <div className="social-icon">
                    <a href="https://www.youtube.com/user/AdvancedLightSource" target="_blank" rel="noopener noreferrer">
                      <YoutubeIcon />
                    </a>
                  </div>
                  <div className="social-icon">
                    <a href="mailto:cscomms@lbl.gov">
                      <EmailIcon />
                    </a>
                  </div>
                  <div className="social-icon">
                    <a href="https://www.linkedin.com/company/lawrence-berkeley-national-laboratory/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
                      <LinkedinIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-middle">
            <img src={BerkeleyLabLogo} alt="Berkeley Lab Logo" className="footer-logo" />
            <div className="footer-links-bottom">
              <span>
                <a href="https://www.lbl.gov/contact/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
                {" | "}
                <a href="https://visits.lbl.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Visit Us</a>
                {" | "}
                <a href="https://www.lbl.gov/subscribe/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Subscribe</a>
              </span>
            </div>
            <div className="partner-logos">
              <img src={DoeLogo} alt="DOE Logo" className="partner-logo" />
              <img src={UcLogo} alt="UC Logo" className="partner-logo" />
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-description">
                Lawrence Berkeley National Laboratory is a U.S. DOE Office of Science<br />
                national laboratory managed by the University of California
              </p>

              <div className="footer-links-bottom">
                <span>
                  <a href="https://phonebook.lbl.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Staff Directory</a>
                  {" | "}
                  <a href="https://elements.lbl.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>For Employees</a>
                  {" | "}
                  <a href="https://status.lbl.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Emergency Status</a>
                  {" | "}
                  <a href="https://www.lbl.gov/terms-and-conditions/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy & Security Notice</a>
                  {" | "}
                  <a href="https://www.lbl.gov/web-support/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Site Feedback</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show error if OpenAI key failed to load */}
      {apiKeyError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          {apiKeyError}
        </div>
      )}

      {/* Main Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '10px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '700px',
            height: '90vh',
            maxHeight: '900px',
            minHeight: '400px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(window.innerWidth <= 768 ? {
              width: 'calc(100vw - 20px)',
              height: 'calc(100vh - 20px)',
              minHeight: '350px',
              borderRadius: '12px'
            } : {})
          }}>
            {/* Header */}
            <div style={{
              padding: window.innerWidth <= 768 ? '15px 20px 12px 20px' : '20px 30px 15px 30px',
              borderBottom: '1px solid #e0e0e0',
              position: 'relative',
              flexShrink: 0
            }}>
              {/* Document Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#000000"/>
                  <path d="M14 2V8H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title and DOI Row */}
              <div style={{
                display: 'flex',
                alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: window.innerWidth <= 768 ? '15px' : '30px'
              }}>
                <h2 style={{
                  margin: '0',
                  color: '#181d27',
                  fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  Add a Publication
                </h2>
                
                {/* DOI Input */}
                <div style={{ 
                  width: window.innerWidth <= 768 ? '100%' : '220px',
                  maxWidth: window.innerWidth <= 768 ? '280px' : '220px'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#414651',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    DOI
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DoiLiveSearch
                      value={formData.doi}
                      onChange={(value) => handleInputChange('doi', value)}
                      onSelectPublication={handlePublicationSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>

            {/* Body - Scrollable Content */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Scrollable Form Content */}
              <div style={{
                padding: window.innerWidth <= 768 ? '15px 20px' : '20px 30px',
                flex: 1,
                overflowY: 'auto', // Enable vertical scrolling
                overflowX: 'hidden', // Prevent horizontal scrolling
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}>
              {/* Title */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: '#414651',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="What is the title?"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : '70%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Abstract */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: '#414651',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Abstract *
                </label>
                <textarea
                  placeholder="e.g. Lorem ipsum dolor sit amet consectetur adipiscing elit. Amet consectetur adipiscing elit quisque faucibus ex sapien."
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  required
                  rows={window.innerWidth <= 768 ? 2 : 3}
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : '70%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Key Points */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: '#414651',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Key Points
                </label>
                <div style={{
                  width: window.innerWidth <= 768 ? '100%' : '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {formData.keyPoints.map((point, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <textarea
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...formData.keyPoints];
                          newPoints[index] = e.target.value;
                          setFormData(prev => ({ ...prev, keyPoints: newPoints }));
                        }}
                        rows={2}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={() => {
                          const newPoints = formData.keyPoints.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, keyPoints: newPoints }));
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        keyPoints: [...prev.keyPoints, '']
                      }));
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 16px',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>+</span> Add Key Point
                  </button>
                </div>
              </div>

              {/* Authors and Categories Row */}
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: window.innerWidth <= 768 ? '18px' : '40px',
                marginBottom: '18px'
              }}>
                {/* Authors */}
                <div style={{ 
                  width: window.innerWidth <= 768 ? '100%' : '35%'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#414651',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Author(s) *
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Zoheb Sharif"
                    value={formData.authors}
                    onChange={(e) => handleInputChange('authors', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Display Category */}
                <div style={{ 
                  width: window.innerWidth <= 768 ? '100%' : '35%'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#414651',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Display Category *
                  </label>
                  <select
                    value={formData.categories}
                    onChange={(e) => handleInputChange('categories', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="" disabled>Choose Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    border: `2px dashed ${dragActive ? '#00313c' : '#ccc'}`,
                    borderRadius: '8px',
                    padding: window.innerWidth <= 768 ? '15px 10px' : '20px 15px',
                    textAlign: 'center',
                    backgroundColor: dragActive ? '#f8f9fa' : '#fafafa',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Upload Icon */}
                  <div style={{
                    fontSize: '32px',
                    color: '#00313c',
                    marginBottom: '8px'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={window.innerWidth <= 768 ? "40" : "50"} height={window.innerWidth <= 768 ? "40" : "50"} viewBox="0 0 50 50"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path stroke="#344054" d="M25 25v18.75m6.479-14.625L24.854 22.5l-6.334 6.333"/><path stroke="#000000" d="M12.5 31.48a13.73 13.73 0 1 1 20.833-15.084a9.6 9.6 0 0 1 1.73-.167A8.73 8.73 0 0 1 37.5 33.333"/></g></svg>
                  </div>
                  
                  <p style={{
                    margin: '0 0 5px 0',
                    color: '#000',
                    fontSize: window.innerWidth <= 768 ? '12px' : '13px',
                    fontFamily: 'Helvetica, sans-serif'
                  }}>
                    Select a file or drag and drop here
                  </p>
                  
                  <p style={{
                    margin: '0 0 15px 0',
                    color: 'rgba(0, 0, 0, 0.4)',
                    fontSize: window.innerWidth <= 768 ? '10px' : '11px',
                    fontFamily: 'Helvetica, sans-serif'
                  }}>
                    JPG, PNG or PDF
                  </p>
                  
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  
                  <label
                    htmlFor="file-input"
                    style={{
                      display: 'inline-block',
                      padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
                      backgroundColor: '#fbfdfe',
                      color: '#0f91d1',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '9px' : '10px',
                      fontFamily: 'Helvetica, sans-serif',
                      border: '1px solid #0f91d1'
                    }}
                  >
                    Select file
                  </label>
                  
                  {formData.files.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      fontSize: '11px',
                      color: '#666'
                    }}>
                      {formData.files.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>

              {/* File Thumbnails */}
              {formData.files.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    flexWrap: 'wrap',
                    maxHeight: window.innerWidth <= 768 ? '100px' : '120px',
                    overflowY: 'auto'
                  }}>
                    {formData.files.map((file, index) => {
                      const fileType = getFileType(file);
                      const previewUrl = getFilePreviewUrl(file);
                      const thumbnailSize = window.innerWidth <= 768 ? '60px' : '80px';
                      const imageSize = window.innerWidth <= 768 ? '40px' : '50px';
                      
                      return (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            minWidth: thumbnailSize,
                            maxWidth: thumbnailSize
                          }}
                        >
                          {/* File Thumbnail/Icon */}
                          <div style={{
                            width: imageSize,
                            height: imageSize,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            {fileType === 'image' && previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={file.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : fileType === 'pdf' ? (
                              <svg width={window.innerWidth <= 768 ? "25" : "30"} height={window.innerWidth <= 768 ? "25" : "30"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#ffebee"/>
                                <polyline points="14,2 14,8 20,8" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <text x="12" y="16" textAnchor="middle" fontSize="4" fill="#d32f2f" fontWeight="bold">PDF</text>
                              </svg>
                            ) : (
                              <svg width={window.innerWidth <= 768 ? "25" : "30"} height={window.innerWidth <= 768 ? "25" : "30"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#f5f5f5"/>
                                <polyline points="14,2 14,8 20,8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          
                          {/* File Name */}
                          <div style={{
                            fontSize: window.innerWidth <= 768 ? '8px' : '9px',
                            color: '#666',
                            textAlign: 'center',
                            lineHeight: '1.2',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              width: window.innerWidth <= 768 ? '16px' : '18px',
                              height: window.innerWidth <= 768 ? '16px' : '18px',
                              borderRadius: '50%',
                              backgroundColor: '#ff4444',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: window.innerWidth <= 768 ? '10px' : '12px',
                              fontWeight: 'bold',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              </div>
              
              {/* Action Buttons - Fixed at bottom, outside scrollable area */}
              <div style={{
                padding: window.innerWidth <= 768 ? '15px 20px' : '20px 30px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: 'white',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                flexShrink: 0 // Prevent shrinking
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                  gap: window.innerWidth <= 768 ? '12px' : '20px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: window.innerWidth <= 768 ? '12px 24px' : '16px 32px',
                      backgroundColor: '#ffffff',
                      color: '#414651',
                      border: '1px solid #414651',
                      borderRadius: '8px',
                      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                      fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      minWidth: window.innerWidth <= 768 ? '100%' : '140px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    style={{
                      padding: window.innerWidth <= 768 ? '12px 24px' : '16px 32px',
                      backgroundColor: '#10303b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                      fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      minWidth: window.innerWidth <= 768 ? '100%' : '180px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d262f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10303b';
                    }}
                  >
                    Add to Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
