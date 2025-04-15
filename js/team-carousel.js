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
    let carouselClickable = true; // Track if carousel is clickable
    
    // Failsafe function to check and fix any incorrectly positioned cards
    function checkCardVisibility() {
        // Get visible area boundaries
        const carouselRect = carousel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Check each card to make sure it's properly positioned
        teamCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const nameElement = card.querySelector('h3');
            
            // If card is active, make sure it's visible
            if (card.classList.contains('active')) {
                if (cardRect.left < 0 || cardRect.right > viewportWidth) {
                    // Card is partially offscreen, fix it
                    setActiveCard(index, null, true);
                    return;
                }
            }
            
            // Make sure name element is properly contained
            if (nameElement) {
                nameElement.style.textOverflow = 'ellipsis';
            }
        });
        
        // Ensure carousel is clickable
        carouselClickable = true;
        
        // Reset pointer events for all cards
        teamCards.forEach(card => {
            card.style.pointerEvents = 'auto';
        });
    }
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index, event, shouldScroll = true) {
        if (isTransitioning || !carouselClickable) return;
        
        // Make the carousel temporarily unclickable during transition
        carouselClickable = false;
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
        
        // Check if this is the last card
        const isLastCard = index === teamCards.length - 1;
        
        // Only scroll if shouldScroll is true
        if (shouldScroll) {
            // Calculate precise scroll position with animation smoothing
            const carouselWidth = carousel.offsetWidth;
            const cardLeft = targetCard.offsetLeft;
            const cardWidth = targetCard.offsetWidth;
            
            // Calculate scroll position to center the card perfectly
            let scrollTo = cardLeft - (carouselWidth / 2) + (cardWidth / 2);
            
            // Special handling for last card on desktop to prevent edge cases
            if (isLastCard && window.innerWidth > 767) {
                // Ensure there's enough space after the last card
                scrollTo = Math.min(scrollTo, carousel.scrollWidth - carouselWidth - 20);
            }
            
            // Ensure we don't scroll past edges
            scrollTo = Math.max(0, Math.min(scrollTo, carousel.scrollWidth - carouselWidth));
            
            // Use RAF for smoother animation
            let startPosition = carousel.scrollLeft;
            let startTime = null;
            const duration = 350; // ms, matching our CSS transition
            
            function animateScroll(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function: cubic-bezier approximation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                // Apply scroll
                carousel.scrollLeft = startPosition + (scrollTo - startPosition) * easeOutQuart;
                
                // Continue animation if not done
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    // Animation complete
                    setTimeout(() => {
                        isTransitioning = false;
                        carouselClickable = true; // Re-enable clicks
                        // Run visibility check after animation completes
                        checkCardVisibility();
                    }, 50);
                }
            }
            
            // Start animation
            requestAnimationFrame(animateScroll);
        } else {
            // If not scrolling, still reset transitioning flag
            setTimeout(() => {
                isTransitioning = false;
                carouselClickable = true; // Re-enable clicks
                // Run visibility check
                checkCardVisibility();
            }, 350); // Match transition time
        }
        
        currentIndex = index;
    }
    
    // Add scroll event listener to check visibility
    carousel.addEventListener('scroll', function() {
        if (!isTransitioning) {
            // Debounce to avoid constant checks during scroll
            clearTimeout(carousel.scrollTimer);
            carousel.scrollTimer = setTimeout(checkCardVisibility, 150);
        }
    });
    
    // Run check on window resize
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(checkCardVisibility, 250);
    });
    
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
    
    // Initialize with first card active but don't scroll to it
    setActiveCard(0, null, false);
    
    // Run visibility check when page becomes visible (in case of background tabs)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(checkCardVisibility, 200);
        }
    });
}); 