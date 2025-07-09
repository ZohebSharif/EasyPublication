
import "./App.css";
import BerkeleyLabLogo from './assets/berkeley-lab-logo.svg';
import DoeLogo from './assets/doe-logo.svg';
import UcLogo from './assets/uc-logo.svg';
import FacebookIcon from './assets/facebook.svg';
import InstagramIcon from './assets/instagram.svg';
import XIcon from './assets/x.svg';
import SearchIcon from './assets/search.svg';
import YoutubeIcon from './assets/youtube.svg';
import PublicationCarousel from "./PublicationCarousel";
function App() {

  const currentBeamline = 'Beamline 8.3.2'
  return (

    <div className="App">
      <div className="AppTopHeader">
        <img src={BerkeleyLabLogo} alt="logo" style={{ filter: 'brightness(0) invert(1)' }} className="headerImage"></img>

      </div>
      
      <div className="header">
        <div className="searchbox" >
          <input className="inputBox" placeholder=" Search" ></input>
          <img src={SearchIcon} alt="search" className="searchImage"></img>
        </div>

        <div className="headerLinks">
            <strong>ALS</strong>
            <strong>Beamlines</strong>
            <strong>Beamline 8.3.2</strong>
        </div>


        <div className="buttonContainer">
        <button className="buttonOne">
           <div className="textOne">
            Web View
            </div>
          </button>

         <button className="buttonTwo">
          <div className="textTwo">
            Slideshow View
          </div>
         </button>
       </div>

      <div className="selected">
        <p>Selected:</p>
         <u>{currentBeamline}</u>
      </div>

        <p>beamline here</p>
      </div>
      <div className="Body">
        <PublicationCarousel />

        <div className="Buffer-Bottom"></div>
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
                  <p>Admin Login</p>
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
                    <img src={FacebookIcon} alt="Facebook" className="social-svg" />
                  </div>
                  <div className="social-icon">
                    <img src={InstagramIcon} alt="Instagram" className="social-svg" />
                  </div>
                  <div className="social-icon">
                    <img src={XIcon} alt="X (Twitter)" className="social-svg" />
                  </div>
                  <div className="social-icon">
                    <img src={YoutubeIcon} alt="YouTube" className="social-svg" />
                  </div>

                </div>
              </div>

            </div>
          </div>

          <div className="footer-middle">
            <img src={BerkeleyLabLogo} alt="Berkeley Lab Logo" className="footer-logo" />
            <div className="footer-links-bottom">
              <span>Contact  |  Visit Us  |  Subscribe</span>
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
                <span>Staff Directory | For Employees | Emergency Status | Privacy & Security Notice | Site Feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}


export default App;