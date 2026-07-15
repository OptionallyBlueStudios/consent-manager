(function () {
  // 1. Grab configuration from the script tag's data-attributes
  const currentScript = document.currentScript;
  const ga4Id = currentScript.getAttribute('data-ga4');
  const clarityId = currentScript.getAttribute('data-clarity');
  const glitchtipDsn = currentScript.getAttribute('data-glitchtip-dsn');

  // 2. Dynamically inject Preconnect and Silktide CSS
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://cdn.jsdelivr.net';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.id = 'silktide-consent-manager-css';
  css.href = 'https://cdn.jsdelivr.net/gh/silktide/consent-manager@v2.0.1/silktide-consent-manager.css';
  css.integrity = 'sha384-EdMq+R+YOnsbelo08wPenoTlnxbAyxI11NMIxzugx/qAsbh64KcOkqxYqq6pfvO/';
  css.crossOrigin = 'anonymous';
  document.head.appendChild(css);

  // 3. Inject CSS Theme Overrides
  const styleOverrides = document.createElement('style');
  styleOverrides.id = 'silktide-consent-manager-overrides';
  styleOverrides.innerHTML = `
    #stcm-wrapper {
      --boxShadow: -5px 5px 10px 0px #00000012, 0px 0px 50px 0px #0000001a;
      --fontFamily: Helvetica Neue, Segoe UI, Arial, sans-serif;
      --primaryColor: #24C6DB;
      --backgroundColor: #282b34;
      --textColor: #ffffff;
      --backdropBackgroundColor: #00000033;
      --backdropBackgroundBlur: 0px;
      --iconColor: #282B34;
      --iconBackgroundColor: #FFFFFF;
    }
  `;
  document.head.appendChild(styleOverrides);

  // 4. Inject Silktide JS and initialize on load
  const jsLoader = document.createElement('script');
  jsLoader.src = 'https://cdn.jsdelivr.net/gh/silktide/consent-manager@v2.0.1/silktide-consent-manager.js';
  jsLoader.integrity = 'sha384-5Pt34uiIbCsvfiiZXoLi4HRf/YBXjr9c8e+gYeVo9smUaInNHYVtc8NZ8wUnXJIq';
  jsLoader.crossOrigin = 'anonymous';
  
  jsLoader.onload = function () {
    initializeConsentManager();
  };
  document.head.appendChild(jsLoader);

  // 5. Initialize the Consent Manager
  function initializeConsentManager() {
    // Build analytics scripts and onAccept callback dynamically
    const analyticsScripts = [];
    
    if (ga4Id) {
      analyticsScripts.push({
        url: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`,
        load: "async"
      });
    }

    window.silktideConsentManager.init({
      backdrop: { show: true },
      icon: { position: "bottomRight" },
      prompt: { position: "bottomRight" },
      consentTypes: [
        {
          id: "essential",
          label: "Essential",
          description: "<p>These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences.</p>",
          required: true,
          onAccept: function () {
            // Load GlitchTip under Essential (it is an error reporting tool, typically classified as Essential)
            if (glitchtipDsn && !window.Sentry) {
              const sentryScript = document.createElement('script');
              sentryScript.src = 'https://browser.sentry-cdn.com/7.x.x/bundle.min.js'; // GlitchTip uses the Sentry SDK
              sentryScript.onload = function() {
                window.Sentry.init({ dsn: glitchtipDsn });
              };
              document.head.appendChild(sentryScript);
            }
          }
        },
        {
          id: "analytics",
          label: "Analytics",
          description: "<p>These cookies help us improve the site by tracking which pages are most popular and how visitors move around the site.</p>",
          required: false,
          gtag: "analytics_storage",
          scripts: analyticsScripts,
          onAccept: function () {
            // Initialize GA4 if provided
            if (ga4Id) {
              window.dataLayer = window.dataLayer || [];
              function gtag() { window.dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', ga4Id);
            }

            // Initialize MS Clarity if provided
            if (clarityId && !window.clarity) {
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", clarityId);
            }
          }
        },
        {
          id: "marketing",
          label: "Marketing",
          description: "<p>These cookies are used by us and our advertising partners to show you relevant ads on this site and elsewhere, and to measure how those campaigns perform.</p>",
          required: false,
          gtag: [
            "ad_storage",
            "ad_user_data",
            "ad_personalization"
          ]
        }
      ],
      text: {
        prompt: {
          description: "<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic. If possible, please accept all cookies.</p><p><a href=\"https://optionallybluestudios.github.io/consent-manager/privacy-policy\" target=\"_blank\">Privacy Policy</a><br></p>",
          acceptAllButtonText: "Accept all",
          acceptAllButtonAccessibleLabel: "Accept all cookies",
          rejectNonEssentialButtonText: "Reject non-essential",
          rejectNonEssentialButtonAccessibleLabel: "Reject all non-essential cookies",
          preferencesButtonText: "Preferences",
          preferencesButtonAccessibleLabel: "Toggle preferences"
        },
        preferences: {
          title: "Customize your cookie preferences",
          description: "<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website. <span style=\"letter-spacing: 0.34px;\">If possible, please accept all cookies.</span></p><p><a href=\"https://optionallybluestudios.github.io/consent-manager/privacy-policy\" target=\"_blank\">Privacy Policy</a><br></p>",
          saveButtonText: "Save and close",
          saveButtonAccessibleLabel: "Save your cookie preferences",
          creditLinkText: "Made with Silktide",
          creditLinkAccessibleLabel: "Made with Silktide"
        }
      }
    });
  }
})();
