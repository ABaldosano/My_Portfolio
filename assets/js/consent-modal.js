/* ==========================================================================
   portfolio :: consent-modal.js — sub-pages required popup variant
   ========================================================================== */

(function () {
  var CONSENT_KEY = 'portfolio_consent';
  var overlay     = document.getElementById('cookie-overlay');
  var modal       = document.getElementById('cookie-modal');
  var acceptBtn   = document.getElementById('cookieAcceptBtn');
  var declineBtn  = document.getElementById('cookieDeclineBtn');

  if (!modal || !overlay || !acceptBtn || !declineBtn) return;

  function dismiss() {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(function () {
      overlay.style.display = 'none';
      modal.style.display   = 'none';
    }, 250);
  }

  if (!localStorage.getItem(CONSENT_KEY)) {
    overlay.style.display = 'block';
    modal.style.display   = 'flex';
    document.body.style.overflow = 'hidden';
  }

  acceptBtn.addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, '1');
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted'
    });
    dismiss();
  });

  declineBtn.addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, '0');
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      functionality_storage: 'denied'
    });
    dismiss();
  });
})();