// Obsidian Google Map Clipper — Content Script
// Extracts place data from Google Maps place pages

(function () {
  'use strict';

  /**
   * Wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver((mutations, obs) => {
        const el = document.querySelector(selector);
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
    // Try hero image
    const heroImg = document.querySelector('img.widget-scene-canvas');
    if (heroImg && heroImg.src) return heroImg.src;

    // Try the main photo button area
    const photoBtn = document.querySelector('button[jsaction*="photo"] img');
    if (photoBtn && photoBtn.src) return photoBtn.src;

    // Try background images in the header area
    const headerImages = document.querySelectorAll('[class*="hero"] img, [class*="photo"] img');
    for (const img of headerImages) {
      if (img.src && !img.src.includes('data:')) return img.src;
    }

    return '';
  }

  /**
   * Extract rating info
   */
  function extractRating() {
    // Look for rating display - typically a large number like "4.5"
    const ratingEl = document.querySelector('div.fontDisplayLarge');
    if (ratingEl) {
      const rating = parseFloat(getText(ratingEl));
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        return rating;
      }
    }

    // Alternative: look for aria-label with rating
    const starEls = document.querySelectorAll('[role="img"][aria-label*="star"], [aria-label*="rating"]');
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
    const reviewEls = document.querySelectorAll('[aria-label*="review"], [aria-label*="評論"], [aria-label*="条评价"]');
    for (const el of reviewEls) {
      const match = el.getAttribute('aria-label')?.match(/([\d,]+)/);
      if (match) return match[1].replace(/,/g, '');
    }

    // Try finding text with parenthesized numbers near the rating
    const fontBodies = document.querySelectorAll('span[aria-label]');
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
    const buttons = document.querySelectorAll('button[data-item-id]');
    buttons.forEach(btn => {
      const itemId = btn.getAttribute('data-item-id') || '';
      const text = getText(btn);

      if (itemId === 'address' || itemId.startsWith('oloc')) {
        data.address = text;
      } else if (itemId.startsWith('phone:') || itemId === 'phone') {
        data.phone = text;
      } else if (itemId === 'authority') {
        data.website = text;
      } else if (itemId === 'oloc') {
        data.plusCode = text;
      }
    });

    // Method 2: Look for links with data-item-id
    const links = document.querySelectorAll('a[data-item-id]');
    links.forEach(link => {
      const itemId = link.getAttribute('data-item-id') || '';
      if (itemId === 'authority') {
        data.website = link.getAttribute('href') || getText(link);
      }
    });

    // Method 3: Fallback — look for info rows with icons
    if (!data.address) {
      const addressBtn = document.querySelector('[data-tooltip="Copy address"], [aria-label*="Address"], [aria-label*="地址"]');
      if (addressBtn) {
        data.address = getText(addressBtn);
      }
    }

    if (!data.phone) {
      const phoneBtn = document.querySelector('[data-tooltip="Copy phone number"], [aria-label*="Phone"], [aria-label*="电话"], [aria-label*="電話"]');
      if (phoneBtn) {
        data.phone = getText(phoneBtn);
      }
    }

    return data;
  }

  /**
   * Extract place category/type
   */
  function extractCategory() {
    // Category button is usually right below the name
    const categoryBtn = document.querySelector('button[jsaction*="category"]');
    if (categoryBtn) return getText(categoryBtn);

    // Try the subtitle / category span
    const subtitleEl = document.querySelector('[class*="fontBodyMedium"] button, [class*="subtitle"]');
    if (subtitleEl) {
      const text = getText(subtitleEl);
      if (text && !text.includes('·') && text.length < 50) return text;
    }

    return '';
  }

  /**
   * Extract opening hours
   */
  function extractHours() {
    const hoursEl = document.querySelector('[aria-label*="hour"], [aria-label*="营业"], [aria-label*="營業"]');
    if (hoursEl) {
      return hoursEl.getAttribute('aria-label') || getText(hoursEl);
    }

    // Try the hours table
    const hoursTable = document.querySelector('table[class*="hour"]');
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
    const nameEl = document.querySelector('h1');
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
    if (document.querySelector('h1') && document.querySelector('[data-item-id="address"]')) return true;
    return false;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractPlaceData') {
      // Give the page a moment to fully render dynamic content
      setTimeout(() => {
        const data = extractPlaceData();
        data.isPlacePage = isPlacePage();
        sendResponse(data);
      }, 300);
      return true; // Keep the message channel open for async response
    }

    if (request.action === 'checkIsPlacePage') {
      sendResponse({ isPlacePage: isPlacePage() });
      return true;
    }
  });
})();
