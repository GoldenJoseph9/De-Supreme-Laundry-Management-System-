// Main Application Initialization - WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Loaded - Initializing application...');
    
    // Initialize core modules that are always needed
    dashboard.init();
    
    // Setup mobile sidebar first
    setupMobileSidebar();
    
    // Navigation between sections - ONLY FOR NAV LINKS
    document.querySelectorAll('.nav-links a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip external links (they have target="_blank")
            if (this.getAttribute('target') === '_blank') {
                return;
            }
            
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                switchToSection(sectionId);
            }
        });
    });
    
    // Initialize the active section on page load
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        initializeSection(sectionId);
    }
    
    // Global modal close handlers
    setupGlobalModalHandlers();
    
    console.log('✅ Application initialized');
});

// Global section switching function
function switchToSection(sectionId) {
    console.log('🔄 Switching to section:', sectionId);
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(navLink => {
        navLink.classList.remove('active');
    });
    
    const activeNavLink = document.querySelector(`.nav-links a[data-section="${sectionId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    // Show the selected section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        initializeSection(sectionId);
    } else {
        console.error('❌ Section not found:', sectionId);
    }
}

// Initialize section-specific functionality
function initializeSection(sectionId) {
    console.log('🚀 Initializing section:', sectionId);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        switch(sectionId) {
            case 'dashboard':
                dashboard.init();
                break;
            case 'crm':
                crm.init();
                break;
            case 'finance':
                finance.init();
                finance.initCharts();
                break;
            case 'scheduling':
                if (typeof scheduling !== 'undefined') scheduling.init();
                break;
            case 'marketing':
                if (typeof marketing !== 'undefined') marketing.init();
                break;
            case 'systems':
                if (typeof ultraSimpleSystems !== 'undefined') ultraSimpleSystems.init();
                break;
            default:
                console.log('📋 No special initialization for:', sectionId);
        }
    }, 100);
}

// Setup global modal handlers
function setupGlobalModalHandlers() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
        
        // Close modal when clicking close button
        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Global click handlers for section switching buttons
    document.addEventListener('click', function(e) {
        // Handle action buttons that switch sections
        const actionBtn = e.target.closest('.action-btn[data-section]');
        if (actionBtn) {
            const section = actionBtn.getAttribute('data-section');
            if (section) {
                switchToSection(section);
            }
        }
    });
}

// Mobile sidebar functionality
function setupMobileSidebar() {
    // Create hamburger menu for mobile
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.style.display = 'none'; // Hidden by default
    
    document.body.appendChild(menuToggle);
    
    // Toggle sidebar on hamburger click
    menuToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Close sidebar when nav link is clicked (mobile only)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // On desktop, ensure sidebar is visible
            document.querySelector('.sidebar').classList.remove('active');
            menuToggle.style.display = 'none';
        } else {
            // On mobile, show hamburger menu
            menuToggle.style.display = 'block';
        }
    });
    
    // Initial check
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
    }
}

// Call this in your DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing code ...
    
    setupMobileSidebar();
});