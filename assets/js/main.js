/* UI Components - LOGIC ONLY (HTML injected by Python Build) */

// Mobile Menu Logic
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Only remove scrolled class if we are on home page where transparency is desired
            if (document.body.classList.contains('page-home')) {
                header.classList.remove('scrolled');
            }
        }
    }
});

// Google Reviews Fetch Implementation (Placeholder logic for Places API)
// In production, you would fetch details of 3 specific Place IDs and cache them.
document.addEventListener("DOMContentLoaded", function () {
    const CACHE_KEY = "samaya_google_reviews";
    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

    // Example format of what the true API block would push to the UI
    const fetchRealReviews = async () => {
        // Here you would insert your actual Google Maps API Key and fetch
        // Place IDs: 
        //   - Casa Samaya (ChIJg84Lw5f34joR6vEa_8aEwS8)
        //   - Café Samaya
        //   - Calma Samaya

        // This is where you would dynamically replace the inner HTML of #google-reviews
        console.log("Reviews logic loaded. Waiting for valid API key integration.");
    };

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const parsedNode = JSON.parse(cachedData);
        if (new Date().getTime() - parsedNode.timestamp < CACHE_TIME) {
            console.log("Using cached Google Reviews data.");
            // Apply parsedNode.data to UI here
            return;
        }
    }

    // Fetch and cache
    fetchRealReviews();
});
