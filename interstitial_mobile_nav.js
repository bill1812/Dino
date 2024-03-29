// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// b.js <-- interstitial_mobile_nav.js

var mobileNav = false;

/**
 * For small screen mobile the navigation buttons are moved
 * below the advanced text.
 */
function onResize() {
  var helpOuterBox = document.querySelector('#details');
  var mainContent = document.querySelector('#main-content');
  var mediaQuery = '(min-width: 240px) and (max-width: 420px) and ' + '(min-height: 401px), ' +
    '(max-height: 560px) and (min-height: 240px) and ' + '(min-width: 421px)';

  var detailsHidden = helpOuterBox.classList.contains(HIDDEN_CLASS);
  var runnerContainer = document.querySelector('.runner-container');

  // Check for change in nav status.
  if (mobileNav != window.matchMedia(mediaQuery).matches) {
    mobileNav = !mobileNav;

    // Handle showing the top content / details sections according to state.
    if (mobileNav) {
      mainContent.classList.toggle(HIDDEN_CLASS, !detailsHidden);
      helpOuterBox.classList.toggle(HIDDEN_CLASS, detailsHidden);
      if (runnerContainer) {
        runnerContainer.classList.toggle(HIDDEN_CLASS, !detailsHidden);
      }
    } else if (!detailsHidden) {

      // Non mobile nav with visible details.
      mainContent.classList.remove(HIDDEN_CLASS);
      helpOuterBox.classList.remove(HIDDEN_CLASS);
      if (runnerContainer) {
        runnerContainer.classList.remove(HIDDEN_CLASS);
      }
    }
  }
}

function setupMobileNav() {
  window.addEventListener('resize', onResize);
  onResize();
}

document.addEventListener('DOMContentLoaded', setupMobileNav);
