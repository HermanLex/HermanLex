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
    initProjectsToggle();
    initVisionInput();
    initVisionToaster();
    initPasswordModal();
    initClickableCards();
    initDisabledLinks();
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
        link.addEventListener('click', (e) => {
            // Prevent navigation if link is disabled
            if (link.classList.contains('disabled')) {
                e.preventDefault();
                return;
            }
            
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
 * Projects Toggle (Show/Hide More Projects)
 */
function initProjectsToggle() {
    const toggle = document.getElementById('projectsToggle');
    const grid = document.querySelector('.projects-grid');
    
    if (!toggle || !grid) return;
    
    toggle.addEventListener('click', () => {
        const isExpanded = grid.classList.contains('expanded');
        
        if (isExpanded) {
            grid.classList.remove('expanded');
            toggle.textContent = '+ view more projects';
            
            // Scroll to projects section when collapsing
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        } else {
            grid.classList.add('expanded');
            toggle.textContent = '- hide projects';
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

/**
 * Vision Toaster Notification
 */
function initVisionToaster() {
    const toaster = document.getElementById('vision-toaster');
    const closeBtn = toaster?.querySelector('.vision-toaster-close');
    
    if (!toaster || !closeBtn) return;
    
    // Show toaster after a short delay
    setTimeout(() => {
        toaster.classList.add('show');
    }, 500);
    
    // Handle close button click
    closeBtn.addEventListener('click', () => {
        toaster.classList.remove('show');
        // Remove from DOM after animation
        setTimeout(() => {
            toaster.remove();
        }, 500);
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toaster.classList.contains('show')) {
            closeBtn.click();
        }
    });
}

/**
 * Vision Input Validation and Image Generation
 */
function initVisionInput() {
    const missionInput = document.getElementById('mission-input');
    const submitBtn = document.getElementById('visionSubmitBtn');
    const visionForm = document.getElementById('vision-form');
    const loadingDiv = document.getElementById('vision-loading');
    const generatedWrapper = document.getElementById('vision-generated-wrapper');
    const generatedImage = document.getElementById('vision-generated-image');
    
    if (!missionInput || !submitBtn || !visionForm) return;
    
    function checkWordCount() {
        const text = missionInput.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        if (wordCount >= 8) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
    
    // Check on input
    missionInput.addEventListener('input', checkWordCount);
    
    // Initial check
    checkWordCount();
    
    // Form submission handler
    visionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const missionText = missionInput.value.trim();
        if (missionText.split(/\s+/).filter(word => word.length > 0).length < 8) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        loadingDiv.style.display = 'block';
        generatedWrapper.style.display = 'block';
        
        const imageLabel = document.getElementById('vision-image-label');
        
        try {
            // Construct the prompt
            const prompt = `1. generate an image (without text in the image) that reflects the mission statement: "${missionText}". 
2. image needs aspect ratio of 16:9
3. use contemporary flat illustration with soft gradients aesthetic style`;
            
            // Call OpenAI DALL-E API
            const imageUrl = await generateImage(prompt);
            
            // Display the generated image and update label
            generatedImage.src = imageUrl;
            generatedImage.alt = 'Generated vision';
            if (imageLabel) {
                imageLabel.textContent = 'Generated image';
            }
            
            // Scroll to the generated image
            generatedWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            console.error('Error generating image:', error);
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Show detailed error message
            let errorMessage = 'Failed to generate image. ';
            if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please check the console for details and try again.';
            }
            alert(errorMessage);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'generate vison';
            loadingDiv.style.display = 'none';
            checkWordCount(); // Re-check word count to maintain disabled state if needed
        }
    });
}

/**
 * Generate image using OpenAI DALL-E API
 * Note: In production, this should be done through a backend proxy to keep API keys secure
 */
async function generateImage(prompt) {
    // IMPORTANT: Replace with your OpenAI API key or use a backend proxy
    // For security, API keys should never be exposed in client-side code
    // This is a placeholder - you should set up a backend endpoint
    const API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your OpenAI API key
    
    console.log('Generating image with prompt:', prompt);
    console.log('API Key present:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No');
    
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1792x1024',
                quality: 'standard'
            })
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${responseText.substring(0, 200)}`);
            }
            
            const errorMessage = errorData.error?.message || errorData.error?.code || 'Unknown error';
            const errorType = errorData.error?.type || 'API Error';
            const errorCode = errorData.error?.code || 'NO_CODE';
            const fullError = `${errorType} (${errorCode}): ${errorMessage}`;
            
            console.error('API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData.error,
                fullResponse: errorData
            });
            
            throw new Error(fullError);
        }
        
        const data = JSON.parse(responseText);
        console.log('Success! Image URL:', data.data?.[0]?.url);
        
        if (!data.data || !data.data[0] || !data.data[0].url) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response format: Missing image URL in response');
        }
        
        return data.data[0].url;
        
    } catch (error) {
        // Re-throw with more context if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Network error: Unable to connect to OpenAI API. Check your internet connection. Original error: ${error.message}`);
        }
        // Re-throw other errors as-is (they already have descriptive messages)
        throw error;
    }
}

/**
 * Make Project Cards Clickable
 */
function initClickableCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Find the "view project" button/link within the card (exclude "visit website" links)
        const viewProjectBtn = card.querySelector('.password-trigger, .video-trigger, .project-link:not(.project-link-website), .project-link-ghost');
        
        if (!viewProjectBtn) return;
        
        // Make card clickable
        card.style.cursor = 'pointer';
        
        // Add click handler to card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on "visit website" link
            const visitWebsiteLink = card.querySelector('.project-link-website');
            if (visitWebsiteLink && (visitWebsiteLink.contains(e.target) || e.target === visitWebsiteLink)) {
                return; // Let the link handle its own click
            }
            
            // Don't trigger if clicking directly on the view project button/link (it will handle itself)
            if (viewProjectBtn.contains(e.target) || e.target === viewProjectBtn) {
                return;
            }
            
            // Trigger the view project button/link click
            viewProjectBtn.click();
        });
        
        // Prevent card click when clicking on "visit website" link
        const visitWebsiteLink = card.querySelector('.project-link-website');
        if (visitWebsiteLink) {
            visitWebsiteLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click from firing
            });
        }
    });
}

/**
 * Disabled Links Handler
 */
function initDisabledLinks() {
    // Prevent navigation on disabled links
    document.querySelectorAll('.nav-link.disabled').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });
}

/**
 * Password Modal Handler
 */
function initPasswordModal() {
    const modal = document.getElementById('passwordModal');
    const triggers = document.querySelectorAll('.password-trigger');
    const closeBtn = document.querySelector('.password-modal-close');
    const overlay = document.querySelector('.password-modal-overlay');
    const form = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('passwordError');
    
    if (!modal || triggers.length === 0) return;
    
    let currentTrigger = null;
    
    function openModal(trigger) {
        currentTrigger = trigger;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        passwordInput.focus();
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
        errorMessage.style.display = 'none';
        currentTrigger = null;
    }
    
    // Trigger clicks
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(trigger);
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
    
    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value.trim();
        
        if (!currentTrigger) return;
        
        const requiredPassword = currentTrigger.dataset.password || 'mastercard2024';
        const targetUrl = currentTrigger.dataset.url || 'mc-offers.html';
        
        if (enteredPassword === requiredPassword) {
            // Check if it should open in new tab (external URL or data-newtab="true")
            const openInNewTab = targetUrl.startsWith('http') || currentTrigger.dataset.newtab === 'true';
            
            if (openInNewTab) {
                // Open in new tab
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
            } else {
                // Redirect to internal page
                window.location.href = targetUrl;
            }
            closeModal();
        } else {
            // Show error message
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}
