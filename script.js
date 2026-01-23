/**
 * Alex Wyrick Portfolio - JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initMobileNav();
    initHeaderScroll();
    initTestimonials();
    initScrollAnimations();
    initSmoothScroll();
    initVideoModal();
    initLogoModal();
});

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (!toggle || !navList) return;
    
    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        navList.classList.toggle('open');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
    
    // Close menu when clicking a link
    navList.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.setAttribute('aria-expanded', 'false');
            navList.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('open')) {
            toggle.setAttribute('aria-expanded', 'false');
            navList.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isMenuOpen = navList.classList.contains('open');
        const isClickInsideNav = navList.contains(e.target);
        const isClickOnToggle = toggle.contains(e.target);
        
        if (isMenuOpen && !isClickInsideNav && !isClickOnToggle) {
            toggle.setAttribute('aria-expanded', 'false');
            navList.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let rafId = null;
    let lastUpdate = 0;
    const throttleDelay = 150; // Only update every 150ms
    
    function updateHeader() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for border
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastUpdate = Date.now();
        rafId = null;
    }
    
    window.addEventListener('scroll', () => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate;
        
        // Only schedule update if enough time has passed and no update is pending
        if (timeSinceLastUpdate >= throttleDelay && !rafId) {
            rafId = window.requestAnimationFrame(updateHeader);
        }
    }, { passive: true });
}

/**
 * Testimonials Slider
 */
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    
    if (testimonials.length === 0 || dots.length === 0) return;
    
    let currentIndex = 0;
    let autoPlayInterval;
    
    function showTestimonial(index) {
        testimonials.forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }
    
    function nextTestimonial() {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(nextIndex);
    }
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextTestimonial, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showTestimonial(index);
            startAutoPlay();
        });
    });
    
    // Start auto-play
    startAutoPlay();
    
    // Pause on hover
    const slider = document.querySelector('.testimonials-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
    }
}

/**
 * Scroll Animations (Intersection Observer)
 */
function initScrollAnimations() {
    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.project-card, .section-title, .skills-description, .offerings-list li, .client-logo'
    );
    
    if (animatedElements.length === 0) return;
    
    // Add fade-in class
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });
    
    // Create observer with optimized settings
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.05,
            rootMargin: '0px 0px -100px 0px'
        }
    );
    
    // Observe elements
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Video Modal
 */
function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoSource = document.getElementById('videoSource');
    const triggers = document.querySelectorAll('.video-trigger');
    const closeBtn = document.querySelector('.video-modal-close');
    const overlay = document.querySelector('.video-modal-overlay');
    
    if (!modal || !videoPlayer || triggers.length === 0) return;
    
    function openModal(videoSrc) {
        videoSource.src = videoSrc;
        videoPlayer.load();
        videoPlayer.play();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        document.body.style.overflow = '';
    }
    
    // Trigger clicks
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const videoSrc = trigger.dataset.video;
            if (videoSrc) openModal(videoSrc);
        });
    });
    
    // Close button
    closeBtn?.addEventListener('click', closeModal);
    
    // Click overlay to close
    overlay?.addEventListener('click', closeModal);
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Logo Modal Handler
 */
function initLogoModal() {
    const modal = document.getElementById('logoModal');
    const trigger = document.getElementById('brandsTrigger');
    const closeBtn = document.querySelector('.logo-modal-close');
    const overlay = document.querySelector('.logo-modal-overlay');
    
    if (!modal || !trigger) return;
    
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Trigger click
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
    
    // Close button
    closeBtn?.addEventListener('click', closeModal);
    
    // Click overlay to close
    overlay?.addEventListener('click', closeModal);
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Form Submission Handler
 */
document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('.submit-btn');
    const originalText = btn.textContent;
    
    // Simulate sending
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = 'Message Sent! ✓';
        btn.style.background = '#065f46';
        
        // Reset form
        this.reset();
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    }, 1500);
});

