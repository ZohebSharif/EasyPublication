// @ts-nocheck
/// <reference types="./lbl-chrome" />
import './lblChrome.js';
import './global.css';
import './index.css';
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
            <img src={BerkeleyLabLogo} alt="Berkeley Lab Logo" style={{height: '40px'}} />
            <div style={{marginTop: '8px', fontSize: '18px', fontWeight: 'bold', color: '#00313c'}}>
            </div>
          </a>
        </div>

      {/*  
        <nav slot="main-nav">
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/features">Features</a></li>
            <li><a href="/templates">Templates</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </nav>
      */}


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
              Blah blah blah
            </h1>
            <p>bluh bluh bluh</p>
          </div>
        </lbl-container>
      </main>

      {/* Footer */}
      <lbl-bu-footer 
        logo-url="/" 
        logo-title="EasyPublication" 
        logo-sub-title="Berkeley Lab Publishing Platform">
        
        <div slot="col-1">
          <h4>Platform</h4>
          <nav className="footer-nav">
            <a href="/features">Features</a>
            <a href="/templates">Templates</a>
            <a href="/pricing">Pricing</a>
            <a href="/api">API</a>
          </nav>
        </div>

        <div slot="col-2">
          <h4>Resources</h4>
          <nav className="footer-nav">
            <a href="/documentation">Documentation</a>
            <a href="/tutorials">Tutorials</a>
            <a href="/support">Support</a>
            <a href="/community">Community</a>
          </nav>
        </div>

        <div slot="col-3">
          <h4>Connect</h4>
          <lbl-icon-list theme="footer">
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="email" 
              link-url="mailto:easypub@lbl.gov" 
              link-text="Email"
              theme="footer">
            </lbl-icon-list-item>
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="x" 
              link-url="https://twitter.com/berkeleylab" 
              link-text="Twitter"
              theme="footer">
            </lbl-icon-list-item>
            <lbl-icon-list-item 
              slot="icon-list-item"
              icon="youtube" 
              link-url="https://youtube.com/berkeleylab" 
              link-text="YouTube"
              theme="footer">
            </lbl-icon-list-item>
          </lbl-icon-list>
          
          <div style={{marginTop: '20px'}}>
            <p style={{fontSize: '14px', color: '#b1b3b3', marginBottom: '10px'}}>
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
      <lbl-bottom-footer></lbl-bottom-footer>
    </div>
  );
}

export default App;