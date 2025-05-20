// Team expandable card carousel functionality

// Helper to detect Safari
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !window.MSStream; // MSStream check for IE11
}

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
    let originalCardsCount = teamCards.length; // Store the original count before cloning
    let isJumpingToReal = false; // Flag to prevent scroll events during a jump to original card

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

    // Set up infinite scrolling by cloning cards
    function setupInfiniteScroll() {
        // Number of cards to clone at each end
        const cloneCount = Math.min(3, originalCardsCount);
        
        // Clone the first cards and append them to the end
        for (let i = 0; i < cloneCount; i++) {
            const clone = teamCards[i].cloneNode(true);
            clone.classList.add('clone');
            clone.dataset.originalIndex = i.toString();
            carousel.appendChild(clone);
        }
        
        // Clone the last cards and prepend them to the beginning
        for (let i = 0; i < cloneCount; i++) {
            const clone = teamCards[originalCardsCount - 1 - i].cloneNode(true);
            clone.classList.add('clone');
            clone.dataset.originalIndex = (originalCardsCount - 1 - i).toString();
            
            // Find the first non-clone card or the start spacer to insert before
            const firstCard = carousel.querySelector('.team-card:not(.clone)');
            if (firstCard) {
                carousel.insertBefore(clone, firstCard);
            } else {
                // Fallback if somehow we can't find a non-clone card
                carousel.insertBefore(clone, carousel.firstElementChild);
            }
        }
        
        // Update the team cards collection after cloning
        const updatedCards = document.querySelectorAll('.team-card');
        
        // Adjust indices for the cloned cards
        updatedCards.forEach((card, idx) => {
            if (card.classList.contains('clone')) {
                card.dataset.cloneIndex = idx.toString();
            }
            
            // Add click handler to the cloned cards
            if (!card.hasAttribute('data-click-bound')) {
                card.setAttribute('data-click-bound', 'true');
                card.addEventListener('click', (event) => {
                    if (idx !== currentIndex || !card.classList.contains('active')) {
                        setActiveCard(idx, event, true, false, false);
                    }
                });
            }
        });
        
        // Initial scroll position after cloning - center to the first real card
        // (cloneCount cards were prepended, so the first original is at cloneCount index)
        setTimeout(() => {
            const firstRealCard = document.querySelectorAll('.team-card')[cloneCount];
            if (firstRealCard) {
                firstRealCard.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
            }
        }, 100);
        
        return updatedCards;
    }
    
    // Actual card elements may change after infinite scroll setup
    let allTeamCards = setupInfiniteScroll();
    
    // Function to find the corresponding real card index for a clone
    function findRealCardIndex(cloneIndex) {
        const card = allTeamCards[cloneIndex];
        if (card && card.classList.contains('clone') && card.dataset.originalIndex) {
            return parseInt(card.dataset.originalIndex);
        }
        return cloneIndex;
    }
    
    // Function to find the index of a card element in the allTeamCards collection
    function findCardIndex(cardElement) {
        return Array.from(allTeamCards).indexOf(cardElement);
    }
    
    // Failsafe function to check and update active card based on visibility
    function updateActiveCardOnScroll() {
        if (isTransitioning || isJumpingToReal) {
            return;
        }

        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenterX = carouselRect.left + carouselRect.width / 2;
        let mostCenteredCardIndex = -1;
        let smallestDistanceToCenter = Infinity;

        allTeamCards.forEach((card, index) => {
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

        if (mostCenteredCardIndex !== -1) {
            const card = allTeamCards[mostCenteredCardIndex];
            
            // Handle when we reach a clone - jump to the corresponding real card
            if (card && card.classList.contains('clone') && !isJumpingToReal) {
                const realIndex = findRealCardIndex(mostCenteredCardIndex);
                const cloneCount = Math.min(3, originalCardsCount);
                
                // Calculate the real card's position in the updated list
                // If it's a beginning clone (before originalIndex 0), jump to the original
                // If it's an ending clone (after originalIndex originalCardsCount-1), jump to the original
                const targetIndex = realIndex + cloneCount;
                
                if (targetIndex !== mostCenteredCardIndex) {
                    isJumpingToReal = true;
                    
                    // Clear active state from all cards first
                    allTeamCards.forEach(c => c.classList.remove('active'));
                    
                    // Set the real card as active
                    const realCard = allTeamCards[targetIndex];
                    if (realCard) {
                        realCard.classList.add('active');
                        
                        // Jump to the real card without animation
                        setTimeout(() => {
                            realCard.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
                            currentIndex = targetIndex;
                            
                            // Reset jumping flag after the jump
                            setTimeout(() => {
                                isJumpingToReal = false;
                            }, 50);
                        }, 0);
                    } else {
                        isJumpingToReal = false;
                    }
                }
            } 
            // Normal active card update
            else if (mostCenteredCardIndex !== currentIndex) {
                setActiveCard(mostCenteredCardIndex, null, false, true, false);
            } 
            // Ensure correct active state
            else if (mostCenteredCardIndex === currentIndex && !card.classList.contains('active')) {
                setActiveCard(mostCenteredCardIndex, null, false, true, false);
            }
        }
    }
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index, event, shouldScroll = true, isScrollEventUpdate = false, isInitialSet = false) {
        if (!isScrollEventUpdate) { 
            if (isTransitioning && !carouselClickable) return;
            if (index === currentIndex && allTeamCards[index] && allTeamCards[index].classList.contains('active') && !isInitialSet) {
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

        allTeamCards.forEach(card => card.classList.remove('active'));
        const targetCard = allTeamCards[index];
        if (!targetCard) {
            console.error('Target card not found at index:', index);
            if (!isScrollEventUpdate) { 
                isTransitioning = false;
                carouselClickable = true;
            }
            return;
        }
        targetCard.classList.add('active');
        
        if (currentIndex !== index) {
            currentIndex = index;
        }

        if (shouldScroll) {
            const scrollBehavior = isInitialSet ? 'auto' : 'smooth';

            requestAnimationFrame(() => { 
                if (isSafari() && scrollBehavior === 'smooth') {
                    const targetCardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
                    const carouselCenter = carousel.offsetWidth / 2;
                    let newScrollLeft = targetCardCenter - carouselCenter;

                    newScrollLeft = Math.max(0, Math.min(newScrollLeft, carousel.scrollWidth - carousel.offsetWidth));

                    if (typeof gsap !== 'undefined') {
                        gsap.to(carousel, { 
                            scrollLeft: newScrollLeft, 
                            duration: 0.5, 
                            ease: 'power1.inOut',
                            onStart: () => {
                                isTransitioning = true; 
                                carouselClickable = false;
                            },
                            onComplete: () => {
                                isTransitioning = false; 
                                carouselClickable = true;
                            }
                        });
                    } else {
                        carousel.scrollLeft = newScrollLeft;
                        setTimeout(() => {
                            isTransitioning = false;
                            carouselClickable = true;
                            updateActiveCardOnScroll();
                        }, 50); 
                    }
                } else if (isSafari() && scrollBehavior === 'auto') { 
                    const targetCardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
                    const carouselCenter = carousel.offsetWidth / 2;
                    carousel.scrollLeft = Math.max(0, Math.min(targetCardCenter - carouselCenter, carousel.scrollWidth - carousel.offsetWidth));
                    setTimeout(() => { 
                        isTransitioning = false;
                        carouselClickable = true;
                    }, 0);
                } else { 
                    targetCard.scrollIntoView({ behavior: scrollBehavior, inline: 'center', block: 'nearest' });
                    if (scrollBehavior === 'auto') {
                        setTimeout(() => {
                            isTransitioning = false;
                            carouselClickable = true;
                        }, 0);
                    }
                }
            });
        } else {
            if ((!isScrollEventUpdate || isInitialSet) && isTransitioning) {
                isTransitioning = false;
                carouselClickable = true;
            }
        }
    }

    // Listen for scrollend to finalize state after scrolling (programmatic or user)
    carousel.addEventListener('scrollend', () => {
        isTransitioning = false;
        carouselClickable = true;
        updateActiveCardOnScroll(); 
    });
    
    // Add scroll event listener to update active card based on centeredness
    // Debounce this to avoid performance issues
    let scrollTimer;
    carousel.addEventListener('scroll', function() {
        if (!isTransitioning && !isJumpingToReal) { 
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateActiveCardOnScroll, 100); 
        }
    });
    
    // Run check on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentIndex !== -1 && allTeamCards[currentIndex]) {
                setActiveCard(currentIndex, null, true, false, false);
            } else if (bomberCardIndex !== -1) {
                // Adjust bomber index to account for cloned cards
                const cloneCount = Math.min(3, originalCardsCount);
                setActiveCard(bomberCardIndex + cloneCount, null, true, false, false);
            }
        }, 250);
    });
    
    // Make sure carousel can be navigated with keyboard
    document.addEventListener('keydown', function(e) {
        if (e.target !== carousel && !carousel.contains(e.target) && document.activeElement !== document.body && !document.activeElement.classList.contains('team-card')) {
           // return;
        }

        let newIndex = currentIndex;
        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = allTeamCards.length - 1; // Loop to last
            }
            setActiveCard(newIndex, e, true, false, false);
        } else if (e.key === 'ArrowRight') {
            newIndex = currentIndex + 1;
            if (newIndex >= allTeamCards.length) {
                newIndex = 0; // Loop to first
            }
            setActiveCard(newIndex, e, true, false, false);
        }
    });
    
    // Initial setup: Set appropriate card active WITHOUT page scroll
    // Adjust bomber index to account for cloned cards at the beginning
    const cloneCount = Math.min(3, originalCardsCount);
    if (bomberCardIndex !== -1) {
        setActiveCard(bomberCardIndex + cloneCount, null, false, false, true);
    } else if (allTeamCards.length > 0) {
        setActiveCard(cloneCount, null, false, false, true); // Start with first original card
    }

    // Intersection Observer for initial centering when carousel is visible
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.8 && !initialCenteringDone) {
                if (currentIndex !== -1 && allTeamCards[currentIndex]) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            allTeamCards[currentIndex].scrollIntoView({behavior: 'auto', inline: 'center', block: 'nearest'});
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
                if (currentIndex !== -1 && allTeamCards[currentIndex]) {
                    setActiveCard(currentIndex, null, true, false, false);
                } else {
                    // Adjust bomber index to account for cloned cards
                    const cloneCount = Math.min(3, originalCardsCount);
                    if (bomberCardIndex !== -1) {
                        setActiveCard(bomberCardIndex + cloneCount, null, true, false, false);
                    }
                }
            }, 200);
        }
    });
}

// If Lenis is not managing the page scroll, or for fallback, we might still want to run this
// if team-carousel.js is loaded standalone. However, for this project, it's controlled by index.js.
// document.addEventListener('DOMContentLoaded', initTeamCarousel); 