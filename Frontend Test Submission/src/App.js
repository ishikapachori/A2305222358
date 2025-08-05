// A2305222358/Frontend Test Submission/src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import UrlShortenerForm from './UrlShortenerForm';
import UrlStatistics from './UrlStatistics';
import { logEvent } from './logger';

function App() {
  const [currentPage, setCurrentPage] = useState('shortener');
  const [shortenedUrls, setShortenedUrls] = useState([]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const shortcodeMatch = path.match(/^\/([a-zA-Z0-9]+)$/);

      if (shortcodeMatch) {
        const shortcode = shortcodeMatch[1];
        const urlEntry = shortenedUrls.find(url => url.shortcode === shortcode);

        if (urlEntry) {
          logEvent("frontend", "info", "redirect", `Shortcode '${shortcode}' clicked. Redirecting to: ${urlEntry.longUrl}`);

          setShortenedUrls(prevUrls =>
            prevUrls.map(url =>
              url.shortcode === shortcode
                ? {
                    ...url,
                    clicks: url.clicks + 1,
                    clickDetails: [...url.clickDetails, {
                      timestamp: new Date().toISOString(),
                      source: document.referrer || 'direct',
                      location: 'Unknown (client-side simulation)'
                    }]
                  }
                : url
            )
          );

          window.location.replace(urlEntry.longUrl);
        } else {
          logEvent("frontend", "warn", "redirect", `Attempted to access unknown shortcode: ${shortcode}`);
          alert(`Short URL '${shortcode}' not found.`);
          window.history.pushState({}, '', '/');
          setCurrentPage('shortener');
        }
      } else if (path === '/statistics') {
        setCurrentPage('statistics');
        logEvent("frontend", "info", "navigation", "Navigated to statistics page.");
      } else {
        setCurrentPage('shortener');
        logEvent("frontend", "info", "navigation", "Navigated to URL shortener page.");
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shortenedUrls]);

  const addShortenedUrl = (newUrl) => {
    setShortenedUrls(prevUrls => [...prevUrls, newUrl]);
    logEvent("frontend", "info", "form", `New URL shortened: ${newUrl.shortcode}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Affordmed URL Shortener</h1>
        <nav className="App-nav">
          <button onClick={() => {
            setCurrentPage('shortener');
            window.history.pushState({}, '', '/');
            logEvent("frontend", "info", "navigation", "Switched to URL shortener form.");
          }} className={currentPage === 'shortener' ? 'active' : ''}>
            Shorten URLs
          </button>
          <button onClick={() => {
            setCurrentPage('statistics');
            window.history.pushState({}, '', '/statistics');
            logEvent("frontend", "info", "navigation", "Switched to URL statistics page.");
          }} className={currentPage === 'statistics' ? 'active' : ''}>
            View Statistics
          </button>
        </nav>
      </header>
      <main className="App-main">
        {currentPage === 'shortener' && (
          <UrlShortenerForm addShortenedUrl={addShortenedUrl} existingShortcodes={shortenedUrls.map(u => u.shortcode)}/>
        )}
        {currentPage === 'statistics' && (
          <UrlStatistics urls={shortenedUrls} />
        )}
      </main>
    </div>
  );
}

export default App;
