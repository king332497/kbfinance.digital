(() => {
  "use strict";

  const DURATION = 260;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  let navigating = false;

  const style = document.createElement("style");
  style.textContent = `
    html.kb-page-transition {
      transition: opacity ${DURATION}ms cubic-bezier(.22,.61,.36,1);
    }
    html.kb-page-transition.kb-page-enter,
    html.kb-page-transition.kb-page-leave {
      opacity: 0.01;
    }
    html.kb-page-transition.kb-page-leave {
      pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      html.kb-page-transition { transition: none !important; }
    }
  `;
  document.head.appendChild(style);

  function enterSoftly() {
    if (reduceMotion) return;
    root.classList.add("kb-page-transition", "kb-page-enter");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("kb-page-enter");
    }));
  }

  function normalizeInternalUrl(target) {
    try {
      const url = new URL(target, window.location.href);
      if (url.origin !== window.location.origin) return null;
      return url;
    } catch {
      return null;
    }
  }

  window.smoothNavigate = (target, duration = DURATION) => {
    const url = normalizeInternalUrl(target);
    if (!url) {
      window.location.href = target;
      return;
    }

    if (reduceMotion) {
      window.location.href = url.href;
      return;
    }

    if (navigating) return;
    navigating = true;
    root.classList.add("kb-page-transition", "kb-page-leave");
    window.setTimeout(() => {
      window.location.href = url.href;
    }, Math.max(0, Number(duration) || DURATION));
  };

  window.smoothStageSwap = (callback, duration = 180) => {
    if (typeof callback !== "function") return;
    if (reduceMotion) {
      callback();
      return;
    }
    if (navigating) return;
    navigating = true;
    root.classList.add("kb-page-transition", "kb-page-leave");
    window.setTimeout(() => {
      callback();
      root.classList.remove("kb-page-leave");
      root.classList.add("kb-page-enter");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.remove("kb-page-enter");
        navigating = false;
      }));
    }, Math.max(0, Number(duration) || 180));
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    if (!link || link.hasAttribute("download") || link.target === "_blank") return;

    const rawHref = link.getAttribute("href") || "";
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

    const url = normalizeInternalUrl(rawHref);
    if (!url) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

    event.preventDefault();
    window.smoothNavigate(url.href);
  }, true);

  window.addEventListener("pageshow", (event) => {
    navigating = false;
    root.classList.remove("kb-page-leave");
    if (event.persisted) enterSoftly();
  });

  enterSoftly();
})();
