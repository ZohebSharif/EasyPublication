// @ts-nocheck
/// <reference types="./lbl-chrome" />
import './lblChrome.js';
import './global.css';

import BerkeleyLabLogo from './assets/berkeley-lab-logo.svg';
import DoeLogo from './assets/doe-logo.svg';
import UcLogo from './assets/uc-logo.svg';

function App() {
  return (
    <div className="app">
      {/* Top Header */}
      <lbl-top-header theme="cloud">
        <lbl-search-form 
          placeholder-text="Search Berkeley Lab" 
          search-url="https://search.lbl.gov/" 
          search-query-parameter="q">
        </lbl-search-form>
      </lbl-top-header>

      {/* Main Header */}
      <lbl-header theme="homesuite">
        <div slot="logo">
          <a href="/" aria-label="EasyPublication - Berkeley Lab">
            <img src={BerkeleyLabLogo} alt="Berkeley Lab Logo" style={{height: '40px', filter: 'brightness(0) invert(1)', color: '#FFFFFF'}} />
            <div style={{marginTop: '8px', fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF'}}>
            </div>
          </a>
        </div>


        <nav slot="main-nav">
          <ul>
            <li><a href="https://als.lbl.gov/" style={{color: "#00313c"}}>ALS</a></li>
            <li><a href="https://als.lbl.gov/beamlines/" style={{color: "#00313c"}}>Beamlines</a></li>
            <li><a href="https://microct.lbl.gov/" style={{color: "#00313c"}}>Beamline 8.3.2</a></li>
            {/*}
            <li><a href="/gallery" style={{color: "#00313c"}}>Gallery</a></li>
            <li><a href="/support" style={{color: "#00313c"}}>Support</a></li>
            */}
          </ul>
        </nav>
      


        <lbl-search-form 
          slot="search"
          placeholder-text="Search" 
          search-url="/search" 
          search-query-parameter="q">
        </lbl-search-form>
      </lbl-header>

      {/* main content here */}
      <main style={{
        minHeight: 'calc(100vh - 200px)', 
        padding: '40px 20px',
        backgroundColor: '#ffffff'
      }}>
        <lbl-container>
          <div style={{
            textAlign: 'center',
            color: '#64666a',
            fontFamily: 'Guardian Text Egyptian Web, georgia, serif'
          }}>
            {/* content here*/}
            <h1 style={{
              fontSize: '2rem',
              color: '#00313c',
              marginBottom: '20px',
              fontFamily: 'franklin-gothic-urw, sans-serif'
            }}>
              Content here
            </h1>
            <p>More content here</p>
          </div>
        </lbl-container>
      </main>

      {/* Footer */}
      <lbl-bu-footer 
        logo-url="/" 
        logo-title="EasyPublication" 
        logo-sub-title="Berkeley Lab Publishing Platform"
        style={{
          '--lbl-color-dark-blue': '#00313c',
          '--footer-title-color': '#FFCB70',
          '--footer-text-color': '#FFFFFF'
        }}>
          <div slot="col-1">
          <h4 style={{color: '#FFCB70'}}>Platform</h4>
          <nav className="footer-nav" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <a href="/features" style={{color: '#FFFFFF', textDecoration: 'none'}}>Features</a>
            <a href="/templates" style={{color: '#FFFFFF', textDecoration: 'none'}}>Templates</a>
            <a href="/pricing" style={{color: '#FFFFFF', textDecoration: 'none'}}>Pricing</a>
            <a href="/api" style={{color: '#FFFFFF', textDecoration: 'none'}}>API</a>          </nav>
        </div>
        
        <div slot="col-2">
          <h4 style={{color: '#FFCB70'}}>Resources</h4>
          <nav className="footer-nav" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <a href="/documentation" style={{color: '#FFFFFF', textDecoration: 'none'}}>Documentation</a>
            <a href="/tutorials" style={{color: '#FFFFFF', textDecoration: 'none'}}>Tutorials</a>
            <a href="/support" style={{color: '#FFFFFF', textDecoration: 'none'}}>Support</a>
            <a href="/community" style={{color: '#FFFFFF', textDecoration: 'none'}}>Community</a>          </nav>
        </div>
        
        <div slot="col-3">
          <h4 style={{color: '#FFCB70'}}>Connect</h4>
          <lbl-icon-list theme="footer" style={{marginTop: '10px', '--icon-settings-color': '#FFFFFF'}}>
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="email" 
              link-url="mailto:easypub@lbl.gov" 
              link-text="Email"
              theme="footer"
              style={{'--icon-settings-color': '#FFFFFF'}}>
            </lbl-icon-list-item>
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="x" 
              link-url="https://twitter.com/berkeleylab" 
              link-text="Twitter"
              theme="footer"
              style={{'--icon-settings-color': '#FFFFFF'}}>
            </lbl-icon-list-item>
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="youtube" 
              link-url="https://youtube.com/berkeleylab" 
              link-text="YouTube"
              theme="footer"
              style={{'--icon-settings-color': '#FFFFFF'}}>
            </lbl-icon-list-item>
          </lbl-icon-list>
          
          <div style={{marginTop: '20px'}}>
            <p style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '10px'}}>
              Powered by Lawrence Berkeley National Laboratory
            </p>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <img src={DoeLogo} alt="DOE Logo" style={{height: '30px'}} />
              <img src={UcLogo} alt="UC Logo" style={{height: '30px'}} />
            </div>
          </div>
        </div>
      </lbl-bu-footer>

      {/* Bottom Footer */}
      <lbl-bottom-footer style={{
        '--legal-color': '#FFFFFF',
        '--footer-nav-link-color': '#FFFFFF',
        '--utility-nav-link-color': '#FFFFFF'
      }}></lbl-bottom-footer>
    </div>
  );
}

export default App;