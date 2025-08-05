// A2305222358/Frontend Test Submission/src/UrlStatistics.js

import React from 'react';

function UrlStatistics({ urls }) {
  if (!urls || urls.length === 0) {
    return (
      <div className="url-statistics-container">
        <h2>URL Statistics</h2>
        <p>No URLs have been shortened yet in this session.</p>
      </div>
    );
  }

  return (
    <div className="url-statistics-container">
      <h2>URL Statistics</h2>
      <div className="statistics-list">
        {urls.map((url) => (
          <div key={url.id} className="statistic-item">
            <h3>Original URL: <a href={url.longUrl} target="_blank" rel="noopener noreferrer">{url.longUrl}</a></h3>
            <p>Shortened URL: <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">{url.shortUrl}</a></p>
            <p>Created On: {new Date(url.creationDate).toLocaleString()}</p>
            <p>Expires On: {new Date(url.expiryDate).toLocaleString()}</p>
            <p>Total Clicks: <strong>{url.clicks}</strong></p>

            {url.clickDetails && url.clickDetails.length > 0 && (
              <div className="click-details">
                <h4>Click Details:</h4>
                <ul>
                  {url.clickDetails.map((click, index) => (
                    <li key={index}>
                      Timestamp: {new Date(click.timestamp).toLocaleString()},
                      Source: {click.source},
                      Location: {click.location}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {url.clickDetails.length === 0 && <p>No click details available yet.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlStatistics;
