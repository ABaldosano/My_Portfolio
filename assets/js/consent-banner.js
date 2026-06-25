/* ==========================================================================
   portfolio :: consent-banner.js — index.html thin bar variant
   ========================================================================== */

(function () {
  var CONSENT_KEY = 'portfolio_consent';
  var banner      = document.getElementById('cookie-banner');
  var acceptBtn   = document.getElementById('cookieAcceptBtn');
  var declineBtn  = document.getElementById('cookieDeclineBtn');

  if (!banner || !acceptBtn || !declineBtn) return;

  function dismissBanner() {
    banner.classList.add('hidden');
    setTimeout(function () { banner.style.display = 'none'; }, 280);
  }

  if (!localStorage.getItem(CONSENT_KEY)) {
    banner.style.display = 'flex';
  }

  acceptBtn.addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, '1');
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted'
    });
    dismissBanner();
  });

  declineBtn.addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, '0');
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      functionality_storage: 'denied'
    });
    dismissBanner();
  });
})();