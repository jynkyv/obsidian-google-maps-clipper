// Obsidian Google Map Clipper — Content Script
// Extracts place data from Google Maps place pages

(function () {
  'use strict';

  /**
   * Get the first visible element matching a selector
   * Splits comma-separated selectors to respect defined priority instead of DOM order
   */
  function getVisible(selectorStr) {
    const selectors = selectorStr.split(',').map(s => s.trim());
    for (const selector of selectors) {
      if (!selector) continue;
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return el;
        }
      }
    }
    return null;
  }

  /**
   * Get all visible elements matching a selector
   * Splits comma-separated selectors to respect defined priority instead of DOM order
   */
  function getVisibles(selectorStr) {
    const selectors = selectorStr.split(',').map(s => s.trim());
    const results = [];
    const seen = new Set();

    for (const selector of selectors) {
      if (!selector) continue;
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (seen.has(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push(el);
          seen.add(el);
        }
      }
    }
    return results;
  }

  /**
   * Wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const el = getVisible(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver((mutations, obs) => {
        const el = getVisible(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Extract text content from an element, trimmed
   */
  function getText(el) {
    return el ? el.textContent.trim() : '';
  }

  /**
   * Extract coordinates from the current URL
   * Google Maps URLs contain @lat,lng,zoom pattern
   */
  function extractCoordinates() {
    const url = window.location.href;

    // Try @lat,lng pattern in URL
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      };
    }

    // Try !3d and !4d pattern (used in some URL formats)
    const dMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (dMatch) {
      return {
        lat: parseFloat(dMatch[1]),
        lng: parseFloat(dMatch[2])
      };
    }

    return null;
  }

  /**
   * Extract the place photo URL from the hero image
   */
  function extractPhotoUrl() {
    // 1. Try modern hero image class
    const heroImg = getVisible('img.widget-scene-canvas');
    if (heroImg && heroImg.src) return heroImg.src;

    // 2. Try the main photo button area
    const photoBtn = getVisible('button[jsaction*="photo"] img, button[jsaction*="heroHeaderImage"] img');
    if (photoBtn && photoBtn.src) return photoBtn.src;

    // 3. Try background images in the header area, avoiding data URIs
    const headerImages = getVisibles('[class*="hero"] img, [class*="photo"] img, img[decoding="async"]');
    for (const img of headerImages) {
      if (img.src && !img.src.includes('data:') && img.src.includes('googleusercontent.com/')) return img.src;
    }

    // 4. Try the meta property for og:image from the document head
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content && ogImage.content.includes('googleusercontent')) return ogImage.content;

    // 5. Try any image that looks like a Google Maps photo URL inside the main pane
    const allImages = getVisibles('img');
    for (const img of allImages) {
      if (img.src && typeof img.src === 'string') {
        // Look for Google user content URLs that are likely photos (not avatars or tiny icons)
        // Usually contains /p/ (for photos) and ends with dimensions like =s680-w680-h510
        if (img.src.includes('googleusercontent.com/p/')) {
          return img.src;
        }
      }
    }

    return '';
  }

  /**
   * Extract rating info
   */
  function extractRating() {
    // Look for rating display - typically a large number like "4.5"
    const ratingEl = getVisible('div.fontDisplayLarge, .F7nice span[aria-hidden="true"]');
    if (ratingEl) {
      const rating = parseFloat(getText(ratingEl));
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        return rating;
      }
    }

    // Alternative: look for aria-label with rating
    const starEls = getVisibles('[role="img"][aria-label*="star"], [role="img"][aria-label*="星"], [aria-label*="rating"]');
    for (const el of starEls) {
      const match = el.getAttribute('aria-label')?.match(/([\d.]+)/);
      if (match) return parseFloat(match[1]);
    }

    return null;
  }

  /**
   * Extract review count
   */
  function extractReviewCount() {
    // Look for review count near rating - usually in parentheses like "(1,234)"
    const reviewEls = getVisibles('[aria-label*="review"], [aria-label*="評論"], [aria-label*="评价"]');
    for (const el of reviewEls) {
      const match = el.getAttribute('aria-label')?.match(/([\d,]+)/);
      if (match) return match[1].replace(/,/g, '');
    }

    // Try finding text with parenthesized numbers near the rating
    const fontBodies = getVisibles('span[aria-label]');
    for (const el of fontBodies) {
      const label = el.getAttribute('aria-label') || '';
      const match = label.match(/([\d,]+)\s*(review|評論|评价|件)/i);
      if (match) return match[1].replace(/,/g, '');
    }

    return '';
  }

  /**
   * Extract data from action buttons (address, phone, website, etc.)
   */
  function extractFromButtons() {
    const data = {
      address: '',
      phone: '',
      website: '',
      plusCode: ''
    };

    // Method 1: Look for buttons with data-item-id
    const buttons = getVisibles('button[data-item-id]');
    buttons.forEach(btn => {
      const itemId = btn.getAttribute('data-item-id') || '';
      const ariaLabel = btn.getAttribute('aria-label') || '';
      const text = getText(btn);

      if (itemId === 'address') {
        // Try to get structured text from child, or fallback to aria-label parsing or full text
        const infoDiv = btn.querySelector('.Io6YTe');
        if (infoDiv && getText(infoDiv)) {
          data.address = getText(infoDiv);
        } else if (ariaLabel.includes(':')) {
          data.address = ariaLabel.split(':').slice(1).join(':').trim();
        } else {
          data.address = text;
        }
      } else if (itemId.startsWith('oloc')) {
        const infoDiv = btn.querySelector('.Io6YTe');
        const codeText = (infoDiv && getText(infoDiv)) ? getText(infoDiv) : (ariaLabel.includes(':') ? ariaLabel.split(':').slice(1).join(':').trim() : text);
        data.plusCode = codeText;
        if (!data.address) {
          data.address = codeText;
        }
      } else if (itemId.startsWith('phone:') || itemId === 'phone') {
        const infoDiv = btn.querySelector('.Io6YTe');
        if (infoDiv && getText(infoDiv)) {
          data.phone = getText(infoDiv);
        } else if (ariaLabel.includes(':')) {
          data.phone = ariaLabel.split(':').slice(1).join(':').trim();
        } else {
          data.phone = text;
        }
      } else if (itemId === 'authority') {
        const infoDiv = btn.querySelector('.Io6YTe');
        data.website = (infoDiv && getText(infoDiv)) ? getText(infoDiv) : text;
      }
    });

    // Method 2: Look for links with data-item-id
    const links = getVisibles('a[data-item-id]');
    links.forEach(link => {
      const itemId = link.getAttribute('data-item-id') || '';
      if (itemId === 'authority') {
        // Attempt to clean the href if its a google redirect
        let url = link.getAttribute('href') || getText(link);
        if (url.includes('google.com/url?q=')) {
          try { url = new URL(url).searchParams.get('q') || url; } catch (e) { }
        }
        data.website = url;
      }
    });

    // Method 3: Fallback — look for info rows with icons
    if (!data.address) {
      const addressBtn = getVisible('[data-tooltip*="address"], [data-tooltip*="地址"], [aria-label*="Address"], [aria-label*="地址"]');
      if (addressBtn) {
        const ariaLabel = addressBtn.getAttribute('aria-label') || '';
        data.address = ariaLabel.includes(':') ? ariaLabel.split(':').slice(1).join(':').trim() : getText(addressBtn);
      }
    }

    if (!data.phone) {
      const phoneBtn = getVisible('[data-tooltip*="phone"], [data-tooltip*="电话"], [aria-label*="Phone"], [aria-label*="电话"], [aria-label*="電話"]');
      if (phoneBtn) {
        const ariaLabel = phoneBtn.getAttribute('aria-label') || '';
        data.phone = ariaLabel.includes(':') ? ariaLabel.split(':').slice(1).join(':').trim() : getText(phoneBtn);
      }
    }

    return data;
  }

  /**
   * Extract place category/type
   */
  function extractCategory() {
    // Category button is usually right below the name
    const categoryBtn = getVisible('button[jsaction*="category"]');
    if (categoryBtn) return getText(categoryBtn);

    // Try the subtitle / category span
    const subtitleEl = getVisible('[class*="fontBodyMedium"] button, [class*="subtitle"]');
    if (subtitleEl) {
      const text = getText(subtitleEl);
      if (text && !text.includes('·') && text.length < 50) return text;
    }

    return '';
  }

  /**
   * Extract price range per person
   */
  function extractPriceRange() {
    // Look for the price button with currency icon (jsname="tJHJj" or class containing price info)
    const priceButtons = getVisibles('[jsname="tJHJj"], .MNVeJb, .UaQhfb');
    for (const btn of priceButtons) {
      const text = getText(btn);
      // Match patterns like "每人 ¥1,000-2,000", "$10-20", "¥1000〜2000" etc.
      const match = text.match(/(每人\s*[¥$€£₩]?[\d,.]+-?[\d,.]*|[¥$€£₩][\d,.]+-[\d,.]*|\$\$|\$\$\$)/i);
      if (match) return match[0].trim();
      // Also try to find price level indicators
      const priceMatch = text.match(/([¥$€£₩][\s\d,.~〜–-]+[\d,.]*)/i);
      if (priceMatch) {
        // Check if there's a "每人" prefix nearby
        const fullMatch = text.match(/(每人[^\n]*[¥$€£₩][\s\d,.~〜–-]+[\d,.]*)/i);
        return fullMatch ? fullMatch[0].trim() : priceMatch[0].trim();
      }
    }

    // Fallback: search aria-labels
    const allBtns = getVisibles('button[aria-label], div[role="button"][aria-label]');
    for (const btn of allBtns) {
      const label = btn.getAttribute('aria-label') || '';
      if (label.includes('¥') || label.includes('$') || label.includes('价') || label.includes('價')) {
        const match = label.match(/(每人[^,]*|[¥$€£₩][\d,.~〜–-]+[\d,.]*)/i);
        if (match) return match[0].trim();
      }
    }

    return '';
  }

  /**
   * Extract opening hours
   */
  function extractHours() {
    // Look for currently open status block
    const currentStatus = getVisible('.ZDu9vd, [class*="isOpen"]');
    if (currentStatus) return getText(currentStatus);

    // Look for aria labels
    const hoursEl = getVisible('[aria-label*="hour"], [aria-label*="营业"], [aria-label*="營業"], [aria-label*="営業時間"]');
    if (hoursEl) {
      return hoursEl.getAttribute('aria-label') || getText(hoursEl);
    }

    // Try the hours table
    const hoursTable = getVisible('table[class*="hour"]');
    if (hoursTable) {
      return getText(hoursTable);
    }

    return '';
  }

  /**
   * Main extraction function — gathers all place data
   */
  function extractPlaceData() {
    // Place name (h1 or main heading)
    const nameEl = getVisible('h1.DUwDvf, h1.fontHeadlineLarge, h1');
    const name = getText(nameEl);

    // Rating
    const rating = extractRating();
    const reviewCount = extractReviewCount();

    // Buttons data (address, phone, website)
    const buttonData = extractFromButtons();

    // Category
    const category = extractCategory();

    // Coordinates
    const coords = extractCoordinates();

    // Photo
    const photoUrl = extractPhotoUrl();

    // Hours
    const hours = extractHours();

    // Price range
    const priceRange = extractPriceRange();

    // Page URL
    const url = window.location.href;

    return {
      name: name,
      address: buttonData.address,
      phone: buttonData.phone,
      website: buttonData.website,
      rating: rating,
      reviewCount: reviewCount,
      category: category,
      coordinates: coords ? `${coords.lat}, ${coords.lng}` : '',
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null,
      hours: hours,
      priceRange: priceRange,
      photoUrl: photoUrl,
      googleMapsUrl: url,
      plusCode: buttonData.plusCode,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Check if current page is a Google Maps place page
   */
  function isPlacePage() {
    const url = window.location.href;
    // Place pages typically have /place/ in the URL
    if (url.includes('/place/')) return true;
    // Or have a selected place panel open
    if (getVisible('h1') && (getVisible('[data-item-id="address"]') || getVisible('button[jsaction*="photo"]'))) return true;
    return false;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractPlaceData') {

      const maxRetries = 10;
      const retryDelay = 200;
      let attempt = 0;

      const tryExtract = () => {
        attempt++;
        const data = extractPlaceData();
        data.isPlacePage = isPlacePage();

        // If we found a name or an address, or we've hit the max retries
        if ((data.name && Object.keys(data).some(k => k !== 'name' && k !== 'extractedAt' && k !== 'isPlacePage' && k !== 'url' && data[k])) || attempt >= maxRetries) {
          sendResponse(data);
        } else {
          // Otherwise wait and try again
          setTimeout(tryExtract, retryDelay);
        }
      };

      // Start extraction attempt
      setTimeout(tryExtract, 300);

      return true; // Keep the message channel open for async response
    }

    if (request.action === 'checkIsPlacePage') {
      sendResponse({ isPlacePage: isPlacePage() });
      return true;
    }
  });
})();
