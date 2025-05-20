// Team expandable card carousel functionality
export function initTeamCarousel() {
    const teamCards = document.querySelectorAll('.team-card');
    const carousel = document.querySelector('.team-carousel');
    
    if (!teamCards || !carousel || teamCards.length === 0) {
        console.warn('Team carousel elements not found');
        return;
    }

    let currentIndex = 0;
    let isTransitioning = false;
    let carouselClickable = true; 
    let bomberCardIndex = -1;

    // Find the "Bomber" card
    teamCards.forEach((card, index) => {
        const nameElement = card.querySelector('h3');
        if (nameElement && nameElement.textContent.toLowerCase().includes('bomber')) {
            bomberCardIndex = index;
        }
    });

    // If Bomber card is not found, default to the first card
    if (bomberCardIndex === -1 && teamCards.length > 0) {
        console.warn('"Bomber" card not found, defaulting to first card.');
        bomberCardIndex = 0;
    }
    
    // Failsafe function to check and update active card based on visibility
    function updateActiveCardOnScroll() {
        if (isTransitioning) return; // Don't interfere with programmatic scroll/transitions

        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenterX = carouselRect.left + carouselRect.width / 2;

        let mostCenteredCardIndex = -1;
        let smallestDistanceToCenter = Infinity;

        teamCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(carouselCenterX - cardCenterX);

            if (distance < smallestDistanceToCenter) {
                smallestDistanceToCenter = distance;
                mostCenteredCardIndex = index;
            }
            
            // Ensure name element text overflow is handled
            const nameElement = card.querySelector('h3');
            if (nameElement) {
                nameElement.style.textOverflow = 'ellipsis';
            }
        });

        if (mostCenteredCardIndex !== -1 && mostCenteredCardIndex !== currentIndex) {
            // Set active without programmatic scroll, as user is driving the scroll
            setActiveCard(mostCenteredCardIndex, null, false, true);
        } else if (mostCenteredCardIndex !== -1 && !teamCards[mostCenteredCardIndex].classList.contains('active')) {
            // If the current index is right, but active class is missing
            setActiveCard(mostCenteredCardIndex, null, false, true);
        }
    }
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index, event, shouldScroll = true, isScrollEventUpdate = false, isInitialSet = false) {
        if (!isScrollEventUpdate && (isTransitioning || !carouselClickable)) return;
        
        if (!isScrollEventUpdate) {
            carouselClickable = false;
            isTransitioning = true;
        }
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        teamCards.forEach(card => {
            card.classList.remove('active');
        });
        
        const targetCard = teamCards[index];
        if (!targetCard) {
            console.error('Target card not found at index:', index);
            if (!isScrollEventUpdate) {
                isTransitioning = false;
                carouselClickable = true;
            }
            return;
        }
        targetCard.classList.add('active');
        
        if (shouldScroll) {
            targetCard.scrollIntoView({ behavior: isInitialSet ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
            // 'scrollend' event will handle resetting isTransitioning and carouselClickable
        } else {
            if (!isScrollEventUpdate) {
                 // If not scrolling programmatically, reset flags after a delay for CSS transitions
                setTimeout(() => {
                    isTransitioning = false;
                    carouselClickable = true;
                }, 350); // Match CSS transition time
            }
        }
        
        currentIndex = index;
    }

    // Listen for scrollend to finalize state after scrolling (programmatic or user)
    carousel.addEventListener('scrollend', () => {
        isTransitioning = false;
        carouselClickable = true;
        updateActiveCardOnScroll(); // Ensure the correct card is marked active
    });
    
    // Add scroll event listener to update active card based on centeredness
    // Debounce this to avoid performance issues
    let scrollTimer;
    carousel.addEventListener('scroll', function() {
        if (!isTransitioning) { // Only run if not programmatically scrolling
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateActiveCardOnScroll, 100); // Adjust delay as needed
        }
    });
    
    // Run check on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentIndex !== -1 && teamCards[currentIndex]) {
                 // Re-center the current active card smoothly after resize
                setActiveCard(currentIndex, null, true);
            } else if (bomberCardIndex !== -1) {
                 // Fallback to bomber card if current is invalid
                setActiveCard(bomberCardIndex, null, true);
            }
        }, 250);
    });
    
    // Add click event for each card
    teamCards.forEach((card, index) => {
        card.addEventListener('mousedown', (event) => {
            // Prevent default to avoid text selection or other issues on drag, but allow focus
            // event.preventDefault(); 
        });
        
        card.addEventListener('click', (event) => {
            if (index !== currentIndex) { // Only set active if it's not already the current one
                setActiveCard(index, event);
            } else if (!card.classList.contains('active')) { // If it's current but not active (e.g. after some edge case)
                setActiveCard(index, event, false); // Re-apply active class without scroll
            }
        });
    });
    
    // Touch swipe functionality for mobile (simplified due to scroll-snap)
    // Native scroll-snap should handle most of the swipe-to-scroll behavior.
    // We primarily need to update the active card after the user swipes.
    // The 'scrollend' event listener and 'scroll' listener should handle this.
    // So, explicit touch start/end for setActiveCard might not be needed or can be simplified.

    // Simplified swipe detection - primarily for updating currentIndex if needed,
    // as scroll-snap and scrollend will handle the visual state.
    let touchStartX = 0;
    let touchStartY = 0; // For detecting vertical scroll
    
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        // isTransitioning = true; // Potentially set to prevent clicks during swipe scroll
    }, { passive: true });
    
    // 'scrollend' will primarily handle updating the active card after a swipe.
    // The 'scroll' event with updateActiveCardOnScroll will catch intermediate states if scrollend is slow.

    // Make sure carousel can be navigated with keyboard
    document.addEventListener('keydown', function(e) {
        if (e.target !== carousel && !carousel.contains(e.target) && document.activeElement !== document.body && !document.activeElement.classList.contains('team-card')) {
            // Only respond to arrow keys if carousel or its children have focus or if body has focus
            // This prevents interference with other page elements or global shortcuts
           // return;
        }

        let newIndex = currentIndex;
        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = teamCards.length - 1; // Loop to last
            }
            setActiveCard(newIndex, e);
        } else if (e.key === 'ArrowRight') {
            newIndex = currentIndex + 1;
            if (newIndex >= teamCards.length) {
                newIndex = 0; // Loop to first
            }
            setActiveCard(newIndex, e);
        }
    });
    
    // Initialize with Bomber card active, but DO NOT scroll to it initially.
    // The card will be styled as active, and visible when the user scrolls to the carousel.
    if (bomberCardIndex !== -1) {
        setActiveCard(bomberCardIndex, null, false, false, true); // shouldScroll is false
    } else if (teamCards.length > 0) {
        // Fallback if Bomber card wasn't found for some reason
        setActiveCard(0, null, false, false, true); // shouldScroll is false
    }
    
    // Initial update of active card based on scroll position if needed (e.g. if already scrolled down)
    // This helps if the page was already scrolled down (e.g. refresh)
    // We don't want to trigger a scroll, just update state if Bomber/first card isn't centered.
    updateActiveCardOnScroll(); 

    // Run visibility check when page becomes visible (in case of background tabs)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                if (currentIndex !== -1 && teamCards[currentIndex]) {
                    setActiveCard(currentIndex, null, true); // Re-center current card
                } else if (bomberCardIndex !== -1) {
                    setActiveCard(bomberCardIndex, null, true); // Fallback
                }
            }, 200);
        }
    });

    // Deprecated checkCardVisibility and original scroll logic removed.
    // The new updateActiveCardOnScroll handles active states based on scroll position.
    // Native scrollIntoView and CSS Scroll Snap handle the actual scrolling mechanics.
}

// If Lenis is not managing the page scroll, or for fallback, we might still want to run this
// if team-carousel.js is loaded standalone. However, for this project, it's controlled by index.js.
// document.addEventListener('DOMContentLoaded', initTeamCarousel); 