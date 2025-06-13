// Theme management system
export const ThemeManager = {
    init() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Add theme toggle event listeners to all theme toggles
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.checked = savedTheme === 'dark';
            toggle.addEventListener('change', this.handleThemeChange);
        });
    },

    handleThemeChange(event) {
        const newTheme = event.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update all theme toggles on the page
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.checked = event.target.checked;
        });
    },

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}; 