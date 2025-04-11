// Team expandable card carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const teamCards = document.querySelectorAll('.team-card');
    const carousel = document.querySelector('.team-carousel');
    
    if (!teamCards || !carousel || teamCards.length === 0) {
        console.warn('Team carousel elements not found');
        return;
    }

    let currentIndex = 0;
    let isTransitioning = false;
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index, event) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Prevent any default behavior and stop propagation
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Remove active class from all cards
        teamCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to the selected card
        const targetCard = teamCards[index];
        targetCard.classList.add('active');
        
        // Scroll the active card into the center view
        targetCard.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
        
        // Reset transitioning flag after animation
        // We need to listen for the scroll end event if possible,
        // but for simplicity, we use a timeout matching CSS transition.
        // A more robust solution might involve scroll end detection.
        setTimeout(() => {
            isTransitioning = false;
        }, 450); // Slightly longer than CSS transition (0.4s)
        
        currentIndex = index;
    }
    
    // Add click event for each card
    teamCards.forEach((card, index) => {
        // Prevent default on mousedown to avoid any jumping
        card.addEventListener('mousedown', (event) => {
            event.preventDefault();
        });
        
        card.addEventListener('click', (event) => {
            setActiveCard(index, event);
        });
    });
    
    // Touch swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;
    let touchStartY = 0;
    
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    });
    
    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Calculate vertical distance
        const verticalDistance = Math.abs(touchEndY - touchStartY);
        
        // Only handle swipe if it's a quick gesture (less than 300ms) and not primarily vertical
        if (touchDuration < 300 && verticalDistance < 50) {
            handleSwipe();
        }
    });
    
    function handleSwipe() {
        if (isTransitioning) return;
        
        // Detect swipe direction and use threshold
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            // Determine direction and calculate new index
            if (swipeDistance < 0) {
                // Swiped left - go forward
                let nextIndex = currentIndex + 1;
                if (nextIndex >= teamCards.length) {
                    nextIndex = 0;
                }
                setActiveCard(nextIndex);
            } else {
                // Swiped right - go backward
                let prevIndex = currentIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = teamCards.length - 1;
                }
                setActiveCard(prevIndex);
            }
        }
    }
    
    // Make sure carousel can be navigated with keyboard
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = teamCards.length - 1;
            }
            setActiveCard(prevIndex);
        } else if (e.key === 'ArrowRight') {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= teamCards.length) {
                nextIndex = 0;
            }
            setActiveCard(nextIndex);
        }
    });
    
    // Initialize with first card active
    setActiveCard(0);
}); 