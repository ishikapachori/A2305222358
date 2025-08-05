// A2305222358/Frontend Test Submission/src/UrlShortenerForm.js

import React, { useState } from 'react';
import { logEvent } from './logger';

function UrlShortenerForm({ addShortenedUrl, existingShortcodes }) {
  const [urls, setUrls] = useState([
    { longUrl: '', validity: '30', customShortcode: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [shortenedResults, setShortenedResults] = useState([]);

  const generateShortcode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
    let result = '';
    const length = 7;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (existingShortcodes.includes(result)) {
      return generateShortcode();
    }
    return result;
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newUrls = [...urls];
    newUrls[index][name] = value;
    setUrls(newUrls);

    setErrors(prevErrors => ({
      ...prevErrors,
      [`${name}-${index}`]: undefined
    }));
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: '30', customShortcode: '' }]);
      logEvent("frontend", "info", "form", "Added new URL input field.");
    } else {
      alert("You can only shorten up to 5 URLs at a time.");
      logEvent("frontend", "warn", "form", "Attempted to add more than 5 URL fields.");
    }
  };

  const removeUrlField = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    logEvent("frontend", "info", "form", `Removed URL input field at index ${index}.`);
  };

  const validateUrlEntry = (urlEntry, index) => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!urlEntry.longUrl || !/^https?:\/\/.+\..+/.test(urlEntry.longUrl)) {
      newErrors[`longUrl-${index}`] = 'Please enter a valid URL (e.g., https://example.com)';
      isValid = false;
      logEvent("frontend", "error", "validation", `Invalid long URL input at index ${index}: ${urlEntry.longUrl}`);
    }

    const validity = parseInt(urlEntry.validity, 10);
    if (isNaN(validity) || validity <= 0) {
      newErrors[`validity-${index}`] = 'Validity must be a positive integer in minutes.';
      isValid = false;
      logEvent("frontend", "error", "validation", `Invalid validity input at index ${index}: ${urlEntry.validity}`);
    }

    if (urlEntry.customShortcode) {
      if (!/^[a-zA-Z0-9]+$/.test(urlEntry.customShortcode)) {
        newErrors[`customShortcode-${index}`] = 'Shortcode must be alphanumeric.';
        isValid = false;
        logEvent("frontend", "error", "validation", `Invalid custom shortcode format at index ${index}: ${urlEntry.customShortcode}`);
      } else if (existingShortcodes.includes(urlEntry.customShortcode)) {
        newErrors[`customShortcode-${index}`] = 'This shortcode is already taken.';
        isValid = false;
        logEvent("frontend", "error", "validation", `Custom shortcode collision at index ${index}: ${urlEntry.customShortcode}`);
      }
    }

    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    logEvent("frontend", "info", "form", "URL shortening form submitted.");

    let allFormsValid = true;
    const newShortenedResults = [];

    urls.forEach((urlEntry, index) => {
      const formIsValid = validateUrlEntry(urlEntry, index);
      if (!formIsValid) {
        allFormsValid = false;
      } else {
        const shortcode = urlEntry.customShortcode || generateShortcode();
        const creationDate = new Date();
        const expiryDate = new Date(creationDate.getTime() + parseInt(urlEntry.validity, 10) * 60 * 1000);

        const newShortenedUrl = {
          id: Date.now() + index,
          longUrl: urlEntry.longUrl,
          shortcode: shortcode,
          shortUrl: `${window.location.origin}/${shortcode}`,
          creationDate: creationDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          clicks: 0,
          clickDetails: [],
        };
        newShortenedResults.push(newShortenedUrl);
        addShortenedUrl(newShortenedUrl);
        logEvent("frontend", "info", "api", `URL shortened successfully (simulated): ${newShortenedUrl.longUrl} -> ${newShortenedUrl.shortUrl}`);
      }
    });

    if (allFormsValid) {
      setShortenedResults(newShortenedResults);
      setUrls([{ longUrl: '', validity: '30', customShortcode: '' }]);
      logEvent("frontend", "info", "form", "All URL shortening requests processed.");
    } else {
      logEvent("frontend", "warn", "form", "URL shortening form submission failed due to validation errors.");
    }
  };

  return (
    <div className="url-shortener-container">
      <h2>Shorten Your URLs</h2>
      <form onSubmit={handleSubmit} className="url-form">
        {urls.map((urlEntry, index) => (
          <div key={index} className="url-input-group">
            <div className="form-field">
              <label htmlFor={`longUrl-${index}`}>Original URL:</label>
              <input
                type="url"
                id={`longUrl-${index}`}
                name="longUrl"
                value={urlEntry.longUrl}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="https://example.com"
                required
              />
              {errors[`longUrl-${index}`] && <p className="error-message">{errors[`longUrl-${index}`]}</p>}
            </div>

            <div className="form-field">
              <label htmlFor={`validity-${index}`}>Validity (minutes):</label>
              <input
                type="number"
                id={`validity-${index}`}
                name="validity"
                value={urlEntry.validity}
                onChange={(e) => handleInputChange(index, e)}
                min="1"
                required
              />
              {errors[`validity-${index}`] && <p className="error-message">{errors[`validity-${index}`]}</p>}
            </div>

            <div className="form-field">
              <label htmlFor={`customShortcode-${index}`}>Custom Shortcode (optional):</label>
              <input
                type="text"
                id={`customShortcode-${index}`}
                name="customShortcode"
                value={urlEntry.customShortcode}
                onChange={(e) => handleInputChange(index, e)}
                placeholder="e.g., mylink123"
                maxLength="20"
              />
              {errors[`customShortcode-${index}`] && <p className="error-message">{errors[`customShortcode-${index}`]}</p>}
            </div>

            {urls.length > 1 && (
              <button type="button" onClick={() => removeUrlField(index)} className="remove-button">
                Remove
              </button>
            )}
          </div>
        ))}

        {urls.length < 5 && (
          <button type="button" onClick={addUrlField} className="add-url-button">
            Add Another URL
          </button>
        )}

        <button type="submit" className="submit-button">Shorten URLs</button>
      </form>

      {shortenedResults.length > 0 && (
        <div className="shortened-results">
          <h3>Your Shortened URLs:</h3>
          {shortenedResults.map((result) => (
            <div key={result.id} className="result-item">
              <p>Original: <a href={result.longUrl} target="_blank" rel="noopener noreferrer">{result.longUrl}</a></p>
              <p>Shortened: <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">{result.shortUrl}</a></p>
              <p>Expires: {new Date(result.expiryDate).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UrlShortenerForm;
