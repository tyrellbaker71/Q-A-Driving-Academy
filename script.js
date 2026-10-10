/* =====================================================
   DRIVING SCHOOL TEMPLATE - script.js
   Mobile menu, hero slideshow, gallery lightbox, Google reviews.
   ===================================================== */

/* =====================================================
   GOOGLE BUSINESS CONFIG  (change these for each school)
   -----------------------------------------------------
   GOOGLE_PLACE_ID     Find it at:
       https://developers.google.com/maps/documentation/places/web-service/place-id
   GOOGLE_REVIEWS_URL  Link to the school's Google reviews. Easiest way: search the
       business on Google Maps, click "Reviews", then copy the page link.
       If left as a placeholder, the link is built from GOOGLE_PLACE_ID instead.
   GOOGLE_RATING       e.g. 4.8   (shown until live data loads; leave 0 to hide)
   GOOGLE_REVIEW_COUNT e.g. 37    (leave 0 to hide)
   GOOGLE_API_KEY      OPTIONAL. Only needed to show review cards. Create a Maps
       JavaScript API + Places API (New) key in Google Cloud and restrict it to
       your website address (HTTP referrers). Leave as placeholder to skip cards.
   ===================================================== */
const GOOGLE_PLACE_ID = "";
const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/to83JMd6a8ym5qTu8";
const GOOGLE_RATING = 0;
const GOOGLE_REVIEW_COUNT = 0;
const GOOGLE_API_KEY = "";
const GOOGLE_REVIEWS_TO_SHOW = 3;

(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false); // close after choosing a link
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* ---------- Hero slideshow ---------- */
  var slides = document.querySelectorAll('.hero .slide');
  var dotsWrap = document.querySelector('.hero-dots');
  var current = 0;
  var timer = null;
  var INTERVAL = 6000; // milliseconds between slides
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].removeAttribute('aria-current');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].setAttribute('aria-current', 'true');
  }

  function start() {
    if (reduceMotion || slides.length < 2) return;
    stop();
    timer = setInterval(function () { showSlide(current + 1); }, INTERVAL);
  }
  function stop() { clearInterval(timer); }

  if (slides.length > 1) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { showSlide(i); start(); });
      dotsWrap.appendChild(b);
    });
    start();
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var images = Array.prototype.slice.call(document.querySelectorAll('#gallery-grid img'));
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img');
  var index = 0;
  var lastFocus = null;

  function openBox(i) {
    index = (i + images.length) % images.length;
    boxImg.src = images[index].currentSrc || images[index].src;
    boxImg.alt = images[index].alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  images.forEach(function (img, i) {
    img.tabIndex = 0;                       // keyboard accessible
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { lastFocus = img; openBox(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lastFocus = img; openBox(i); }
    });
  });

  box.querySelector('.lb-close').addEventListener('click', closeBox);
  box.querySelector('.lb-prev').addEventListener('click', function () { openBox(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { openBox(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    if (e.key === 'ArrowLeft') openBox(index - 1);
    if (e.key === 'ArrowRight') openBox(index + 1);
  });

  /* ---------- Gentle reveal on scroll (service cards and benefits only) ---------- */
  var items = document.querySelectorAll('.card, .benefit');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }


  /* ---------- Google reviews ---------- */
  function isSet(v) { return typeof v === 'string' && v !== '' && v.indexOf('YOUR_') !== 0; }

  var elRating = document.getElementById('g-rating');
  var elStars = document.getElementById('g-stars');
  var elCount = document.getElementById('g-count');
  var elLink = document.getElementById('g-link');
  var elCards = document.getElementById('g-cards');

  function starsPct(r) { return Math.max(0, Math.min(5, r)) / 5 * 100 + '%'; }

  function showSummary(rating, count) {
    rating = Number(rating) || 0;
    count = Number(count) || 0;
    if (rating > 0) {
      elRating.textContent = rating.toFixed(1);
      elRating.hidden = false;
      elStars.querySelector('.stars-fill').textContent = '\u2605\u2605\u2605\u2605\u2605';
      elStars.querySelector('.stars-fill').style.width = starsPct(rating);
      elStars.setAttribute('aria-label', 'Rated ' + rating.toFixed(1) + ' out of 5');
      elStars.hidden = false;
    }
    elCount.textContent = count > 0
      ? 'Based on ' + count + ' Google review' + (count === 1 ? '' : 's')
      : 'Read what our learners say on Google';
  }

  function renderCards(reviews) {
    reviews.slice(0, GOOGLE_REVIEWS_TO_SHOW).forEach(function (r) {
      var text = r.text || '';
      if (!text) return;
      var card = document.createElement('article');
      card.className = 'review-card';

      var stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', 'Rated ' + r.rating + ' out of 5');
      var fill = document.createElement('span');
      fill.className = 'stars-fill';
      fill.textContent = '\u2605\u2605\u2605\u2605\u2605';
      fill.style.width = starsPct(r.rating);
      stars.appendChild(fill);

      var p = document.createElement('p');
      p.className = 'review-text';
      p.textContent = text;                       // textContent keeps it safe

      var who = document.createElement('div');
      who.className = 'reviewer';
      var a = r.authorAttribution || {};
      if (a.photoURI) {
        var img = document.createElement('img');
        img.src = a.photoURI; img.alt = ''; img.width = 40; img.height = 40;
        img.referrerPolicy = 'no-referrer';
        who.appendChild(img);
      }
      var info = document.createElement('div');
      var name = document.createElement(a.uri ? 'a' : 'strong');
      name.textContent = a.displayName || 'Google user';
      if (a.uri) { name.href = a.uri; name.target = '_blank'; name.rel = 'noopener'; }
      var strong = document.createElement('strong');
      strong.appendChild(name);
      info.appendChild(strong);
      if (r.relativePublishTimeDescription) {
        var when = document.createElement('span');
        when.textContent = r.relativePublishTimeDescription;
        info.appendChild(when);
      }
      who.appendChild(info);

      card.appendChild(stars); card.appendChild(p); card.appendChild(who);
      elCards.appendChild(card);
    });
    if (elCards.children.length) elCards.hidden = false;
  }

  if (elRating) {
    // Link to all reviews
    if (isSet(GOOGLE_REVIEWS_URL)) {
      elLink.href = GOOGLE_REVIEWS_URL; elLink.hidden = false;
    } else if (isSet(GOOGLE_PLACE_ID)) {
      elLink.href = 'https://search.google.com/local/reviews?placeid=' + encodeURIComponent(GOOGLE_PLACE_ID);
      elLink.hidden = false;
    }

    // Summary from the manual values first (works with no API key)
    showSummary(GOOGLE_RATING, GOOGLE_REVIEW_COUNT);

    // Optional: live rating, count and review cards via Google Places
    if (isSet(GOOGLE_API_KEY) && isSet(GOOGLE_PLACE_ID)) {
      window.__initGooglePlaces = function () {
        google.maps.importLibrary('places').then(function (lib) {
          var place = new lib.Place({ id: GOOGLE_PLACE_ID });
          return place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews'] }).then(function () {
            if (place.rating) showSummary(place.rating, place.userRatingCount);
            if (place.reviews && place.reviews.length) renderCards(place.reviews);
          });
        }).catch(function (err) { console.warn('Google reviews could not be loaded:', err); });
      };
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_API_KEY) +
              '&loading=async&callback=__initGooglePlaces';
      document.head.appendChild(s);
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
