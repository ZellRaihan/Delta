// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Set active nav item based on current page
    setActiveNavItem();
});

// Mobile menu toggle functionality
function initMobileMenu() {
    // Try to get the mobile toggle button and navigation menu
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (!mobileNavToggle || !mainNav) {
        // If elements don't exist yet (component loading), wait and try again
        if (document.getElementById('header-container')) {
            const checkInterval = setInterval(function() {
                const toggle = document.getElementById('mobile-nav-toggle');
                const nav = document.getElementById('main-nav');
                
                if (toggle && nav) {
                    clearInterval(checkInterval);
                    setupMobileMenuEvents(toggle, nav);
                }
            }, 100);
        }
    } else {
        // Elements exist, set up events
        setupMobileMenuEvents(mobileNavToggle, mainNav);
    }
}

// Set up mobile menu event listeners
function setupMobileMenuEvents(toggle, nav) {
    // Toggle menu when button is clicked
    toggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        console.log('Mobile menu toggled');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav.classList.contains('active') && 
            !nav.contains(event.target) && 
            !toggle.contains(event.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Prevent clicks inside the menu from closing it
    nav.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Set active nav item based on current page
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    
    // Wait for nav items to be available (in case of component loading)
    const checkNavItems = setInterval(function() {
        const navItems = document.querySelectorAll('.main-nav li');
        
        if (navItems.length > 0) {
            clearInterval(checkNavItems);
            
            navItems.forEach(item => {
                item.classList.remove('active');
                const link = item.querySelector('a');
                
                if (link) {
                    const href = link.getAttribute('href');
                    
                    if (currentPath === href || 
                        (href !== '/' && currentPath.startsWith(href)) ||
                        (currentPath === '/' && href === '/')) {
                        item.classList.add('active');
                    }
                }
            });
        }
    }, 100);
} 