// Verkflöde Theme Switcher

(function() {
    // Theme management
    const THEME_KEY = 'verkflode-theme';
    const LIGHT_THEME = 'light';
    const DARK_THEME = 'dark';
    
    // Logo paths
    const LOGOS = {
        light: 'images/verkflode-L.png',
        dark: 'images/verkflode-D.png',
        lightTransparent: 'images/verkflode-Lt.png',
        darkTransparent: 'images/verkflode-Dt.png'
    };

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Determine initial theme
        let theme;
        if (savedTheme) {
            theme = savedTheme;
        } else if (systemPrefersDark) {
            theme = DARK_THEME;
        } else {
            theme = LIGHT_THEME;
        }
        
        applyTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
            }
        });
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        
        // Update logo
        updateLogo(theme);
        
        // Update theme toggle button
        updateThemeToggle(theme);
        
        // Update meta theme-color
        updateMetaThemeColor(theme);
    }

    // Update logo based on theme
    function updateLogo(theme) {
        const logoImg = document.querySelector('.logo-img');
        if (logoImg) {
            const newSrc = theme === DARK_THEME ? LOGOS.darkTransparent : LOGOS.lightTransparent;
            
            // Smooth transition
            logoImg.style.opacity = '0';
            setTimeout(() => {
                logoImg.src = newSrc;
                logoImg.style.opacity = '1';
            }, 150);
        }
    }

    // Update theme toggle button
    function updateThemeToggle(theme) {
        const themeToggle = document.getElementById('themeToggle');
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        
        const isDark = theme === DARK_THEME;
        const ariaLabel = isDark ? 'Växla till ljust läge' : 'Växla till mörkt läge';
        
        const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>`;
        
        const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>`;
        
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', ariaLabel);
            themeToggle.innerHTML = isDark ? lightIcon : darkIcon;
        }
        
        if (mobileThemeToggle) {
            mobileThemeToggle.setAttribute('aria-label', ariaLabel);
            mobileThemeToggle.innerHTML = isDark ? lightIcon : darkIcon;
        }
    }

    // Update meta theme-color for mobile browsers
    function updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === DARK_THEME ? '#181818' : '#FFFFFF';
        }
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
        
        // Announce change for screen readers
        announceThemeChange(newTheme);
    }

    // Announce theme change for accessibility
    function announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Tema ändrat till ${theme === DARK_THEME ? 'mörkt' : 'ljust'} läge`;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Prevent flash of incorrect theme
    function preventFlash() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? DARK_THEME : LIGHT_THEME);
        
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Run immediately to prevent flash
    preventFlash();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeThemeSystem);
    } else {
        initializeThemeSystem();
    }

    function initializeThemeSystem() {
        initTheme();
        
        // Add click listeners to theme toggles
        const themeToggle = document.getElementById('themeToggle');
        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', toggleTheme);
        }
        
        // Keyboard shortcut for theme toggle (Alt + T)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    // Export functions for external use
    window.VerkflodeTheme = {
        toggle: toggleTheme,
        set: applyTheme,
        get: () => document.documentElement.getAttribute('data-theme')
    };
})();

// Screen reader only styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
});