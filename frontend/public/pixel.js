(function() {
    'use strict';
    
    // Neuvera.ai Tracking Pixel
    const NEUVERA_API = window.location.origin + '/api';
    
    // Check for Do Not Track
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
        return;
    }
    
    // Utility functions
    function getClientIP() {
        // In production, this would be handled server-side
        return 'client_ip_' + Math.random().toString(36).substr(2, 9);
    }
    
    function getUserAgent() {
        return navigator.userAgent || 'unknown';
    }
    
    function getCurrentUrl() {
        return window.location.href;
    }
    
    function generateSessionId() {
        const stored = sessionStorage.getItem('neuvera_session_id');
        if (stored) return stored;
        
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('neuvera_session_id', sessionId);
        return sessionId;
    }
    
    // Main tracking function
    function track(eventType, metadata = {}) {
        const data = {
            event_type: eventType,
            page_url: getCurrentUrl(),
            user_agent: getUserAgent(),
            ip_address: getClientIP(),
            metadata: {
                ...metadata,
                session_id: generateSessionId(),
                timestamp: new Date().toISOString(),
                screen_resolution: screen.width + 'x' + screen.height,
                viewport_size: window.innerWidth + 'x' + window.innerHeight,
                referrer: document.referrer || 'direct',
                language: navigator.language || 'unknown'
            }
        };
        
        // Send data to backend
        if (typeof fetch !== 'undefined') {
            fetch(NEUVERA_API + '/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                keepalive: true
            }).catch(err => {
                console.debug('Neuvera tracking error:', err);
            });
        } else {
            // Fallback for older browsers
            const img = new Image(1, 1);
            img.src = NEUVERA_API + '/track?' + new URLSearchParams(data).toString();
        }
    }
    
    // Track page view immediately
    track('page_view');
    
    // Track user interactions
    let clickTimeout;
    document.addEventListener('click', function(e) {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            const element = e.target;
            const tagName = element.tagName.toLowerCase();
            const elementClass = element.className || '';
            const elementId = element.id || '';
            
            track('click', {
                element_tag: tagName,
                element_class: elementClass,
                element_id: elementId,
                element_text: element.textContent ? element.textContent.substring(0, 100) : ''
            });
        }, 100);
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
                maxScrollDepth = scrollDepth;
                track('scroll', {
                    scroll_depth: scrollDepth
                });
            }
        }, 250);
    });
    
    // Track time spent on page
    let timeSpent = 0;
    const timeInterval = setInterval(() => {
        timeSpent += 30; // 30 seconds
        
        // Track every 30 seconds, 2 minutes, 5 minutes
        if (timeSpent === 30 || timeSpent === 120 || timeSpent === 300) {
            track('time_spent', {
                seconds: timeSpent
            });
        }
    }, 30000);
    
    // Track page unload
    window.addEventListener('beforeunload', function() {
        clearInterval(timeInterval);
        track('page_unload', {
            total_time_spent: timeSpent
        });
    });
    
    // Track visibility changes
    document.addEventListener('visibilitychange', function() {
        track('visibility_change', {
            hidden: document.hidden
        });
    });
    
    // Expose tracking function globally
    window.neuveraTrack = track;
    
    // Track custom events for buttons and forms
    setTimeout(() => {
        // Track button clicks
        const buttons = document.querySelectorAll('button, [role="button"]');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                track('button_click', {
                    button_text: button.textContent?.substring(0, 50) || '',
                    button_class: button.className || ''
                });
            });
        });
        
        // Track form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                track('form_submit', {
                    form_id: form.id || '',
                    form_class: form.className || ''
                });
            });
        });
        
        // Track link clicks
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                track('link_click', {
                    link_url: link.href || '',
                    link_text: link.textContent?.substring(0, 50) || ''
                });
            });
        });
    }, 1000);
    
})();