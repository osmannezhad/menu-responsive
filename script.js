/* =========================================================
   Nova — Responsive Header behaviour
   ========================================================= */
(function () {
  "use strict";

  const header    = document.getElementById("site-header");
  const hamburger = document.getElementById("hamburger");
  const drawer    = document.getElementById("mobile-menu");
  const overlay   = document.getElementById("mobile-overlay");
  const closeBtn  = document.getElementById("mobile-close");
  const toggles   = document.querySelectorAll(".mobile-dropdown-toggle");

  let lastFocused = null;

  /* ---------- open / close mobile drawer ---------- */
  function openMenu() {
    lastFocused = document.activeElement;
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    hamburger.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    lockScroll();
    const firstLink = drawer.querySelector("a, button");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    unlockScroll();
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  }

  function isOpen() {
    return drawer.classList.contains("is-open");
  }

  if (hamburger) hamburger.addEventListener("click", function () {
    isOpen() ? closeMenu() : openMenu();
  });

  if (overlay)  overlay.addEventListener("click", closeMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  /* ---------- Escape key ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  /* ---------- Close the drawer when resizing back to desktop ---------- */
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 860 && isOpen()) closeMenu();
    }, 120);
  });

  /* ---------- Mobile accordion sub-menus ---------- */
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const parent = btn.closest(".mobile-dropdown");
      const expanded = btn.getAttribute("aria-expanded") === "true";

      /* close siblings */
      toggles.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const p = other.closest(".mobile-dropdown");
          if (p) p.classList.remove("is-open");
        }
      });

      btn.setAttribute("aria-expanded", String(!expanded));
      if (parent) parent.classList.toggle("is-open", !expanded);
    });
  });

  /* ---------- Shadow on scroll ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- iOS-friendly scroll lock ---------- */
  let scrollY = 0;
  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.width = "100%";
  }
  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }

  /* =========================================================
     Search overlay
     ========================================================= */
  const searchOpen    = document.getElementById("search-open");
  const searchOverlay = document.getElementById("search-overlay");
  const searchClose   = document.getElementById("search-close");
  const searchForm    = document.getElementById("search-form");
  const searchInput   = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const searchEmpty   = document.getElementById("search-empty");
  const searchEmptyTerm = document.getElementById("search-empty-term");
  const searchTags    = document.getElementById("search-tags");
  const searchHint    = document.getElementById("search-hint");

  /* The content that can be searched. */
  const INDEX = [
    { title: "Home",             meta: "Page",   href: "#", group: "Pages" },
    { title: "Web Design",       meta: "Service", href: "#", group: "Services" },
    { title: "App Development",  meta: "Service", href: "#", group: "Services" },
    { title: "SEO & Marketing",  meta: "Service", href: "#", group: "Services" },
    { title: "Portfolio",        meta: "Page",   href: "#", group: "Pages" },
    { title: "Pricing",          meta: "Page",   href: "#", group: "Pages" },
    { title: "Contact",          meta: "Page",   href: "#", group: "Pages" }
  ];

  let searchLastFocused = null;
  let activeIndex = -1;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(title, query) {
    if (!query) return escapeHtml(title);
    const at = title.toLowerCase().indexOf(query.toLowerCase());
    if (at === -1) return escapeHtml(title);
    const end = at + query.length;
    return escapeHtml(title.slice(0, at)) +
           "<mark>" + escapeHtml(title.slice(at, end)) + "</mark>" +
           escapeHtml(title.slice(end));
  }

  function isSearchOpen() {
    return searchOverlay.classList.contains("is-open");
  }

  function getMatches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return INDEX.filter(function (item) {
      return item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q);
    });
  }

  function renderResults(query) {
    const q = query.trim();
    const matches = getMatches(query);

    searchResults.innerHTML = "";
    activeIndex = -1;

    /* Empty query → show the popular tags again */
    if (!q) {
      searchTags.hidden = false;
      searchHint.hidden = false;
      searchEmpty.hidden = true;
      return;
    }

    searchTags.hidden = true;
    searchHint.hidden = true;

    if (matches.length === 0) {
      searchEmpty.hidden = false;
      if (searchEmptyTerm) searchEmptyTerm.textContent = q;
      return;
    }

    searchEmpty.hidden = true;

    matches.forEach(function (item, i) {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      const a = document.createElement("a");
      a.href = item.href;
      a.dataset.index = String(i);
      a.innerHTML =
        '<i class="fa-solid fa-arrow-right"></i>' +
        "<span>" + highlight(item.title, q) + "</span>" +
        '<span class="search-result-meta">' + escapeHtml(item.meta) + "</span>";
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }

  function setActive(idx) {
    const links = searchResults.querySelectorAll("a");
    if (!links.length) return;
    if (idx < 0) idx = links.length - 1;
    if (idx >= links.length) idx = 0;
    links.forEach(function (l) { l.classList.remove("is-active"); });
    links[idx].classList.add("is-active");
    activeIndex = idx;
    links[idx].scrollIntoView({ block: "nearest" });
  }

  function openSearch() {
    searchLastFocused = document.activeElement;
    searchOverlay.classList.add("is-open");
    searchOverlay.setAttribute("aria-hidden", "false");
    if (searchOpen) searchOpen.setAttribute("aria-expanded", "true");
    lockScroll();
    window.setTimeout(function () {
      if (searchInput) searchInput.focus();
    }, 120);
  }

  function closeSearch() {
    /* close the mobile drawer too, so only one layer is ever open */
    if (isOpen()) closeMenu();

    searchOverlay.classList.remove("is-open");
    searchOverlay.setAttribute("aria-hidden", "true");
    if (searchOpen) searchOpen.setAttribute("aria-expanded", "false");
    if (searchInput) searchInput.value = "";
    renderResults("");
    unlockScroll();
    if (searchLastFocused) searchLastFocused.focus({ preventScroll: true });
  }

  if (searchOpen) searchOpen.addEventListener("click", openSearch);
  if (searchClose) searchClose.addEventListener("click", closeSearch);

  /* click on the dark backdrop (not the panel) closes it */
  if (searchOverlay) {
    searchOverlay.addEventListener("click", function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  /* live filtering */
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderResults(searchInput.value);
    });
  }

  /* popular tags fill the input */
  if (searchTags) {
    searchTags.addEventListener("click", function (e) {
      const tag = e.target.closest(".search-tag");
      if (!tag) return;
      searchInput.value = tag.textContent.trim();
      renderResults(searchInput.value);
      searchInput.focus();
    });
  }

  /* keyboard: arrows to move, Enter to follow, Esc to close */
  if (searchOverlay) {
    searchOverlay.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === "Enter") {
        const links = searchResults.querySelectorAll("a");
        if (activeIndex >= 0 && links[activeIndex]) {
          e.preventDefault();
          links[activeIndex].click();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      }
    });
  }

  /* following a result closes the overlay */
  if (searchResults) {
    searchResults.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeSearch();
    });
  }

  /* Ctrl/Cmd + K opens search from anywhere */
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isSearchOpen() ? closeSearch() : openSearch();
    }
  });

  renderResults("");

  /* =========================================================
     Footer
     ========================================================= */
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* back-to-top button */
  const toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Collapse footer columns on phones (accordion) */
  const footerToggles = document.querySelectorAll(".footer-toggle");
  const phoneQuery = window.matchMedia("(max-width: 560px)");

  footerToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!phoneQuery.matches) return;
      const col = btn.closest(".footer-col");
      const open = btn.getAttribute("aria-expanded") === "true";

      footerToggles.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const c = other.closest(".footer-col");
          if (c) c.classList.remove("is-open");
        }
      });

      btn.setAttribute("aria-expanded", String(!open));
      if (col) col.classList.toggle("is-open", !open);
    });
  });

  /* reset the footer state when leaving / entering phone width */
  function resetFooter() {
    if (phoneQuery.matches) return;
    footerToggles.forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      const c = btn.closest(".footer-col");
      if (c) c.classList.remove("is-open");
    });
  }
  if (phoneQuery.addEventListener) phoneQuery.addEventListener("change", resetFooter);
  else if (phoneQuery.addListener) phoneQuery.addListener(resetFooter);
})();
