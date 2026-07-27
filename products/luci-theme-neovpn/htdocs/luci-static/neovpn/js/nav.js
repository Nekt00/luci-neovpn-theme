(function () {
  "use strict";

  function initNavigation() {
    var body = document.body;
    var drawer = document.getElementById("neovpn-sidebar");
    var overlay = document.querySelector(".neovpn-overlay--drawer");
    var openTrigger = document.querySelector(".neovpn-header__menu");
    var closeTrigger = document.querySelector(".neovpn-sidebar__close");
    var menuContainer = document.getElementById("topmenu");
    var lastTrigger = null;
    var mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 768px)") : null;

    if (!body || !drawer || !overlay || !openTrigger || !closeTrigger) {
      return;
    }

    if (body.dataset.neovpnNavInitialized === "1") {
      return;
    }

    body.dataset.neovpnNavInitialized = "1";

    function isMobile() {
      return mobileQuery ? mobileQuery.matches : true;
    }

    function getFocusableElements() {
      return drawer.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])");
    }

    function syncState(open) {
      var mobile = isMobile();

      body.classList.toggle("neovpn-theme--drawer-open", open && mobile);
      body.classList.toggle("neovpn-theme--scroll-lock", open && mobile);
      overlay.hidden = !open || !mobile;
      openTrigger.setAttribute("aria-expanded", open ? "true" : "false");
      closeTrigger.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", (!mobile || open) ? "false" : "true");
    }

    function openDrawer(trigger) {
      if (!isMobile()) {
        return;
      }

      lastTrigger = trigger || openTrigger;
      syncState(true);
      closeTrigger.focus();
    }

    function closeDrawer() {
      syncState(false);
      if (lastTrigger) {
        lastTrigger.focus();
      }
    }

    openTrigger.addEventListener("click", function (event) {
      event.preventDefault();
      openDrawer(event.currentTarget);
    });

    closeTrigger.addEventListener("click", function (event) {
      event.preventDefault();
      closeDrawer();
    });

    overlay.addEventListener("click", function () {
      closeDrawer();
    });

    document.addEventListener("keydown", function (event) {
      if (!body.classList.contains("neovpn-theme--drawer-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeDrawer();
        return;
      }

      if (event.key === "Tab") {
        var focusable = getFocusableElements();

        if (!focusable.length) {
          return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    if (menuContainer) {
      menuContainer.addEventListener("click", function (event) {
        var target = event.target;

        if (target && target.tagName === "A" && isMobile()) {
          closeDrawer();
        }
      });
    }

    if (mobileQuery && typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", function (event) {
        if (!event.matches) {
          closeDrawer();
        }
      });
    }

    syncState(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation, { once: true });
  } else {
    initNavigation();
  }
}());
