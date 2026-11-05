/**
 * Choice Aire — Steve Jobs-Grade Multi-Page Application Engine
 * Handles Navigation Dropdowns, Mobile Menu, Solution Tabs,
 * FAQ Accordions, Booking Drawers, and Interactive Forms across all routes.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSolutionTabs();
  initFaqAccordion();
  initBookingDrawer();
  initConcierge();
  initSmoothScroll();
  initScrollReveal();
  initStatCounters();
});

/* --------------------------------------------------------------------------
   1. Header Sticky Elevation
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   2. Mobile Menu Navigation (Supports Smooth CSS Drawer & Sub-menus)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (!toggle || !navMenu) return;

  const closeMenu = () => {
    navMenu.classList.remove('active');
    toggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isActive = navMenu.classList.toggle('active');
    toggle.classList.toggle('active');
    document.body.classList.toggle('menu-open', isActive);
  };

  toggle.addEventListener('click', toggleMenu);

  // Close when clicking nav links or dropdown items
  const navLinks = navMenu.querySelectorAll('.nav-dropdown-item, .nav-link:not(.has-sub)');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const isMobileNav = window.getComputedStyle(toggle).display !== 'none';
      if (isMobileNav) {
        closeMenu();
      }
    });
  });

  // Handle accordion submenus on mobile/tablet drawer
  const parentLinks = navMenu.querySelectorAll('.nav-item > .nav-link.has-sub');
  parentLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const isMobileNav = window.getComputedStyle(toggle).display !== 'none';
      if (isMobileNav) {
        e.preventDefault();
        e.stopPropagation();
        const parentItem = link.closest('.nav-item');
        if (parentItem) {
          parentItem.classList.toggle('open');
        }
      }
    });
  });

  // Close menu on click outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Homepage: Solution Category Switcher Tabs
   -------------------------------------------------------------------------- */
const solutionData = {
  repair: {
    title: 'Precision Diagnostics & Rapid Repairs',
    desc: 'From refrigerant leaks and dead capacitors to furnace ignition failures, our factory-trained specialists inspect every component to find the root cause and restore comfort quickly.',
    img: './assets/images/modern_heat_pump.webp',
    checks: [
      'Rapid response across Summit, Stark, Portage & Medina',
      'Transparent upfront quote before any work begins',
      'Service by N.A.T.E. and EPA certified master technicians'
    ]
  },
  installation: {
    title: 'Energy-Efficient System Replacements',
    desc: 'Upgrade to high-efficiency Bryant inverter heat pumps or gas furnaces. Optimize seasonal energy efficiency with qualifying utility rebates and flexible financing options with approved credit.',
    img: './assets/images/modern_heat_pump.webp',
    checks: [
      'Top-tier Bryant Factory Authorized equipment',
      'Special financing options available with approved credit',
      'Manufacturer warranty protection on new equipment'
    ]
  },
  maintenance: {
    title: 'Precision Seasonal Tune-Up & Safety Audit',
    desc: 'Seasonal preventative maintenance ensures optimal airflow, cleans critical coils, checks electrical connections, and verifies safe burner and blower operation before seasonal extremes hit.',
    img: './assets/images/technician.webp',
    checks: [
      'Comprehensive safety and performance inspection',
      'Verify electrical connections, amp draw and safety shutoffs',
      'Help maintain equipment efficiency and reduce seasonal strain'
    ]
  },
  iaq: {
    title: 'Whole-Home Air Purification & Humidity Control',
    desc: 'Eliminate airborne allergens, bacteria, dust mites, and odors with whole-house MERV-16 hospital-grade filtration, active UV lamps, and automated steam humidifiers.',
    img: './assets/images/hero_home.webp',
    checks: [
      '99.98% capture rate for airborne contaminants',
      'Relief for allergy and asthma sufferers',
      'Balanced humidity prevents dry winter skin & wood warping'
    ]
  },
  upgrade: {
    title: 'Smart Thermostats & Multi-Zone Inverters',
    desc: 'Take complete control of every room in your home. Smart variable-capacity compressors automatically ramp up or down to keep each living zone at your desired temperature.',
    img: './assets/images/modern_heat_pump.webp',
    checks: [
      'Individual temperature control for bedrooms and living rooms',
      'Wi-Fi smartphone control and energy usage analytics',
      'Whisper-quiet decibel levels comparable to a library'
    ]
  }
};

function initSolutionTabs() {
  const tabsNav = document.getElementById('solutionTabsNav');
  const panel = document.getElementById('solutionContentPanel');
  if (!tabsNav) return;

  const tabButtons = tabsNav.querySelectorAll('.solution-tab-btn');
  const titleEl = document.getElementById('solutionTabTitle');
  const descEl = document.getElementById('solutionTabDesc');
  const imgEl = document.getElementById('solutionTabImg');
  const checklistEl = document.getElementById('solutionChecklist');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabKey = btn.getAttribute('data-tab');
      const data = solutionData[tabKey];
      if (!data) return;

      if (panel) {
        panel.style.opacity = '0.3';
        panel.style.transform = 'translateY(6px)';
      }

      setTimeout(() => {
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (imgEl) imgEl.src = data.img;

        if (checklistEl) {
          checklistEl.innerHTML = data.checks.map(c => `
            <div class="solution-check-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${c}</span>
            </div>
          `).join('');
        }

        if (panel) {
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        }
      }, 150);
    });
  });
}

/* --------------------------------------------------------------------------
   4. Universal FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isAlreadyActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Booking Drawer & Modals across all routes
   -------------------------------------------------------------------------- */
function initBookingDrawer() {
  const drawer = document.getElementById('bookingDrawer');
  const overlay = document.getElementById('bookingOverlay');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const serviceSelect = document.getElementById('bookService');
  const bookingForm = document.getElementById('bookingForm');
  const successMsg = document.getElementById('bookingSuccessMsg');
  const openButtons = document.querySelectorAll('.open-booking-btn');

  if (!drawer || !overlay) return;

  const openDrawer = (serviceKey) => {
    if (serviceKey && serviceSelect) {
      const exists = Array.from(serviceSelect.options).some(opt => opt.value === serviceKey);
      if (exists) {
        serviceSelect.value = serviceKey;
      } else if (serviceKey.includes('furnace')) {
        serviceSelect.value = 'furnace-repair';
      } else if (serviceKey.includes('install')) {
        serviceSelect.value = 'ac-installation';
      } else if (serviceKey.includes('commercial')) {
        serviceSelect.value = 'commercial-hvac';
      } else {
        serviceSelect.value = 'general-estimate';
      }
    }
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceVal = btn.getAttribute('data-service') || 'general-estimate';
      openDrawer(serviceVal);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBookingBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }

      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'block';
        if (submitBtn) {
          submitBtn.textContent = 'Confirmed!';
          submitBtn.style.background = 'var(--color-accent)';
        }

        setTimeout(() => {
          bookingForm.reset();
          if (successMsg) successMsg.style.display = 'none';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Priority Dispatch';
            submitBtn.style.background = '';
          }
          closeDrawer();
        }, 2200);
      }, 700);
    });
  }
}

/* --------------------------------------------------------------------------
   6. Floating Concierge Trigger
   -------------------------------------------------------------------------- */
function initConcierge() {
  const concierge = document.getElementById('conciergeWidget');
  if (!concierge) return;

  concierge.addEventListener('click', () => {
    const trigger = document.querySelector('.open-booking-btn');
    if (trigger) {
      trigger.click();
    }
  });
}

/* --------------------------------------------------------------------------
   7. Smooth Anchor Scrolling
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Kinetic Scroll Reveal System (Zero-Overhead IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   9. Animated Stat Counters with Easing
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isK = el.getAttribute('data-format') === 'k';
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;

      if (isK) {
        const valInK = Math.floor(currentVal / 1000);
        el.textContent = `${valInK}K${suffix}`;
      } else if (decimals > 0) {
        el.textContent = `${currentVal.toFixed(decimals)}${suffix}`;
      } else {
        el.textContent = `${Math.floor(currentVal)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (isK) {
          el.textContent = `${Math.floor(target / 1000)}K${suffix}`;
        } else if (decimals > 0) {
          el.textContent = `${target.toFixed(decimals)}${suffix}`;
        } else {
          el.textContent = `${target}${suffix}`;
        }
      }
    };

    requestAnimationFrame(update);
  };

  if (!('IntersectionObserver' in window)) {
    statNumbers.forEach(animateCounter);
    return;
  }

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(num => statsObserver.observe(num));
}

