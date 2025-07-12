import "./App.css";
import { useNavigate } from 'react-router-dom';
import BerkeleyLabLogo from './assets/berkeley-lab-logo.svg';
import DoeLogo from './assets/doe-logo.svg';
import UcLogo from './assets/uc-logo.svg';
import FacebookIcon from './assets/facebook.svg?react';
import InstagramIcon from './assets/instagram.svg?react';
import XIcon from './assets/x.svg?react';
import SearchIcon from './assets/search.svg?react';
import YoutubeIcon from './assets/youtube.svg?react';
import EmailIcon from './assets/email.svg?react';
import LinkedinIcon from './assets/linkedin.svg?react';
import PublicationCarousel from "./PublicationCarousel";

function Home() {
  const currentBeamline = 'Beamline 8.3.2'
  const navigate = useNavigate();

  // Category labels for the four carousels
  const categories = [
    "chemistry and energy",
    "physics and condensed matter", 
    "bioscience",
    "geoscience and environment"
  ];

  const handleCSALogin = () => {
    navigate('/admin');
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
                <a href="https://als.lbl.gov/">ALS</a>
            </strong>
            <strong>
                <a href="https://als.lbl.gov/beamlines/">Beamlines</a>
            </strong>
            <strong>
                <a href="https://als.lbl.gov/beamlines/8.3.2/">{currentBeamline}</a>
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

         <div className="selected">
           <p style = {{color:"#676767"}}>Selected:</p>
           <u style = {{color:"#676767"}}>{currentBeamline}</u>
         </div>
       </div>
      </div>
      
      <div className="Body">
        <PublicationCarousel category={categories[0]} />
        <PublicationCarousel category={categories[1]} />
        <PublicationCarousel category={categories[2]} />
        <PublicationCarousel category={categories[3]} />
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
                  <p onClick={handleCSALogin} style={{ cursor: 'pointer' }}>CSA Staff Login</p>
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
    </div>
  );
}

export default Home;
