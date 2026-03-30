// dashboard.js

// Sidebar state management
let sidebarCollapsed = false;
const SIDEBAR_STORAGE_KEY = 'dashboard_sidebar_collapsed';

// DOM elements
let sidebar;
let mainContent;
let toggleBtn;

// Initialize sidebar functionality
function initSidebar() {
    sidebar = document.getElementById('sidebar');
    mainContent = document.getElementById('main-content');
    toggleBtn = document.getElementById('sidebar-toggle');
    
    if (!sidebar || !toggleBtn) {
        console.warn('Sidebar elements not found');
        return;
    }
    
    // Load saved state
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState !== null) {
        sidebarCollapsed = savedState === 'true';
        applySidebarState();
    }
    
    // Setup toggle button
    toggleBtn.addEventListener('click', toggleSidebar);
    
    // Add keyboard shortcut (Ctrl+B or Cmd+B)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
    });
    
    // Handle responsive behavior
    setupResponsiveSidebar();
}

// Toggle sidebar visibility
function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    applySidebarState();
    saveSidebarState();
    dispatchSidebarChangeEvent();
}

// Apply current sidebar state to UI
function applySidebarState() {
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (toggleBtn) toggleBtn.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('sidebar-collapsed');
    } else {
        sidebar.classList.remove('collapsed');
        if (toggleBtn) toggleBtn.classList.remove('collapsed');
        if (mainContent) mainContent.classList.remove('sidebar-collapsed');
    }
}

// Save state to localStorage
function saveSidebarState() {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed.toString());
}

// Dispatch custom event for other components
function dispatchSidebarChangeEvent() {
    const event = new CustomEvent('sidebarToggle', {
        detail: { collapsed: sidebarCollapsed }
    });
    document.dispatchEvent(event);
}

// Setup responsive behavior
function setupResponsiveSidebar() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleResponsiveChange(e) {
        if (e.matches) {
            // On mobile, collapse sidebar by default
            if (!sidebarCollapsed) {
                sidebarCollapsed = true;
                applySidebarState();
            }
            // Change toggle button behavior for mobile
            if (toggleBtn) {
                toggleBtn.removeEventListener('click', toggleSidebar);
                toggleBtn.addEventListener('click', toggleMobileSidebar);
            }
        } else {
            // On desktop, restore normal behavior
            if (toggleBtn) {
                toggleBtn.removeEventListener('click', toggleMobileSidebar);
                toggleBtn.addEventListener('click', toggleSidebar);
            }
        }
    }
    
    // Mobile-specific toggle with overlay
    function toggleMobileSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        applySidebarState();
        
        if (!sidebarCollapsed) {
            // Add overlay when sidebar is open on mobile
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => {
                sidebarCollapsed = true;
                applySidebarState();
                overlay.remove();
            });
            document.body.appendChild(overlay);
        } else {
            // Remove overlay when sidebar is closed
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
    }
    
    // Initial check and listener
    handleResponsiveChange(mediaQuery);
    mediaQuery.addListener(handleResponsiveChange);
}

// Public API
window.DashboardSidebar = {
    init: initSidebar,
    toggle: toggleSidebar,
    isCollapsed: () => sidebarCollapsed,
    collapse: () => {
        sidebarCollapsed = true;
        applySidebarState();
        saveSidebarState();
    },
    expand: () => {
        sidebarCollapsed = false;
        applySidebarState();
        saveSidebarState();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}