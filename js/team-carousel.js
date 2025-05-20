// Team expandable card carousel functionality
export function initTeamCarousel() {
    const teamCards = document.querySelectorAll('.team-card');
    const carousel = document.querySelector('.team-carousel');
    const teamSection = document.querySelector('.team-section'); // Get the parent section
    
    if (!teamCards || !carousel || !teamSection || teamCards.length === 0) {
        console.warn('Team carousel or section elements not found');
        return;
    }

    let currentIndex = 0;
    let isTransitioning = false;
    let carouselClickable = true; 
    let bomberCardIndex = -1;
    let initialCenteringDone = false; // Flag to ensure centering happens only once on first intersection

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
        if (isTransitioning) {
            // console.log("updateActiveCardOnScroll: Exiting because isTransitioning is true.");
            return;
        }

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
            const nameElement = card.querySelector('h3');
            if (nameElement) {
                nameElement.style.textOverflow = 'ellipsis';
            }
        });

        if (mostCenteredCardIndex !== -1 && mostCenteredCardIndex !== currentIndex) {
            // console.log(`updateActiveCardOnScroll: New most centered card is ${mostCenteredCardIndex}, current is ${currentIndex}. Calling setActiveCard.`);
            setActiveCard(mostCenteredCardIndex, null, false, true, false);
        } else if (mostCenteredCardIndex !== -1 && mostCenteredCardIndex === currentIndex && teamCards[mostCenteredCardIndex] && !teamCards[mostCenteredCardIndex].classList.contains('active')) {
            // console.log(`updateActiveCardOnScroll: Card ${mostCenteredCardIndex} is current but not active. Re-activating without scroll.`);
            setActiveCard(mostCenteredCardIndex, null, false, true, false);
        } else {
            // console.log(`updateActiveCardOnScroll: No change needed. mostCenteredCardIndex: ${mostCenteredCardIndex}, currentIndex: ${currentIndex}, active: ${teamCards[mostCenteredCardIndex] ? teamCards[mostCenteredCardIndex].classList.contains('active') : 'N/A'}`);
        }
    }
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index, event, shouldScroll = true, isScrollEventUpdate = false, isInitialSet = false) {
        if (!isScrollEventUpdate) { 
            if (isTransitioning && !carouselClickable) return;
            if (index === currentIndex && teamCards[index] && teamCards[index].classList.contains('active') && !isInitialSet) {
                isTransitioning = false; 
                carouselClickable = true;
                return;
            }
            carouselClickable = false;
            isTransitioning = true;
        } 

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        teamCards.forEach(card => card.classList.remove('active'));
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
        
        if (!isScrollEventUpdate || isInitialSet) { 
            currentIndex = index;
        } else { 
            if (currentIndex !== index) currentIndex = index;
        }

        if (shouldScroll) { 
            // Wait for next animation frame to ensure card is fully rendered
            requestAnimationFrame(() => {
                setTimeout(() => {
                    targetCard.scrollIntoView({ behavior: isInitialSet ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
                    isTransitioning = false;
                    carouselClickable = true;
                }, 0);
            });
        } else { 
            if (!isScrollEventUpdate || isInitialSet) { 
                isTransitioning = false;
                carouselClickable = true;
            }
        }
    }

    // Listen for scrollend to finalize state after scrolling (programmatic or user)
    carousel.addEventListener('scrollend', () => {
        // console.log(`Scrollend event fired. Current scrollLeft: ${carousel.scrollLeft}`);
        
        // Delay re-enabling scroll-snap slightly
        setTimeout(() => {
            if (carousel && carousel.style.scrollSnapType === 'none') {
                carousel.style.scrollSnapType = 'x mandatory';
                // console.log("Scrollend (delayed): Snap type re-enabled.");
            }
        }, 50); // Small delay, e.g., 50ms. Adjust if needed.

        isTransitioning = false;
        carouselClickable = true;
        // console.log("Scrollend: Transitioning and clickable flags reset.");
        updateActiveCardOnScroll(); 
    });
    
    // Add scroll event listener to update active card based on centeredness
    // Debounce this to avoid performance issues
    let scrollTimer;
    carousel.addEventListener('scroll', function() {
        if (!isTransitioning) { 
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateActiveCardOnScroll, 100); 
        }
    });
    
    // Run check on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentIndex !== -1 && teamCards[currentIndex]) {
                setActiveCard(currentIndex, null, true, false, false); // shouldScroll = true to re-center
            } else if (bomberCardIndex !== -1) {
                setActiveCard(bomberCardIndex, null, true, false, false);
            }
        }, 250);
    });
    
    // Add click event for each card
    teamCards.forEach((card, index) => {
        card.addEventListener('mousedown', (event) => {});
        
        card.addEventListener('click', (event) => {
            // console.log(`Click event on card ${index}. currentIndex: ${currentIndex}, isTransitioning: ${isTransitioning}`);
            if (index !== currentIndex || !teamCards[index].classList.contains('active')) {
                 setActiveCard(index, event, true, false, false); // User click always implies shouldScroll=true
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
            setActiveCard(newIndex, e, true, false, false);
        } else if (e.key === 'ArrowRight') {
            newIndex = currentIndex + 1;
            if (newIndex >= teamCards.length) {
                newIndex = 0; // Loop to first
            }
            setActiveCard(newIndex, e, true, false, false);
        }
    });
    
    // Initial setup: Set Bomber active WITHOUT page scroll
    if (bomberCardIndex !== -1) {
        setActiveCard(bomberCardIndex, null, false, false, true); // shouldScroll = false
    } else if (teamCards.length > 0) {
        setActiveCard(0, null, false, false, true); // shouldScroll = false
    }

    // Intersection Observer for initial centering when carousel is visible
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.8 && !initialCenteringDone) {
                if (currentIndex !== -1 && teamCards[currentIndex]) {
                    // Wait for next animation frame to ensure card is fully rendered
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            teamCards[currentIndex].scrollIntoView({behavior: 'auto', inline: 'center', block: 'nearest'});
                        }, 0);
                    });
                }
                initialCenteringDone = true;
            }
        });
    };
    const carouselObserver = new IntersectionObserver(observerCallback, { threshold: 0.8 });
    carouselObserver.observe(teamSection);

    // Run visibility check when page becomes visible (in case of background tabs)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                if (currentIndex !== -1 && teamCards[currentIndex]) {
                    setActiveCard(currentIndex, null, true, false, false);
                } else if (bomberCardIndex !== -1) {
                    setActiveCard(bomberCardIndex, null, true, false, false);
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