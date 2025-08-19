// Team expandable card carousel functionality

// Helper to detect Safari
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !window.MSStream; // MSStream check for IE11
}

export function initTeamCarousel() {
    const teamCardsNodeList = document.querySelectorAll('.team-card');
    const carousel = document.querySelector('.team-carousel');
    const teamSection = document.querySelector('.team-section');

    if (!teamCardsNodeList || !carousel || !teamSection || teamCardsNodeList.length === 0) {
        console.warn('Team carousel or section elements not found');
        return;
    }

    const allTeamCards = Array.from(teamCardsNodeList);
    const spacerStart = carousel.querySelector('.carousel-spacer-start');
    const spacerEnd = carousel.querySelector('.carousel-spacer-end');

    function updateSpacers() {
        if (!spacerStart || !spacerEnd) return;
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            // Use CSS spacer width: 50vw for guaranteed centering
            const spacerWidth = window.innerWidth / 2; // 50vw
            spacerStart.style.width = spacerWidth + 'px';
            spacerEnd.style.width = spacerWidth + 'px';
            spacerStart.style.flexShrink = '0';
            spacerEnd.style.flexShrink = '0';
        } else {
            // On desktop, reset to CSS defaults
            spacerStart.style.width = '';
            spacerEnd.style.width = '';
        }
    }
    let currentIndex = 0;
    let isTransitioning = false;
    let isAutoScrolling = false;

    // Find preferred initial card (e.g., "Bomber")
    const bomberCardIndex = allTeamCards.findIndex(card => {
        const nameElement = card.querySelector('h3');
        return nameElement && nameElement.textContent.toLowerCase().includes('bomber');
    });

    // Find the most centered card relative to the carousel viewport
    function getMostCenteredIndex() {
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
        });
        return mostCenteredCardIndex;
    }

    function scrollCardIntoCenter(targetCard, behavior = 'smooth') {
        updateSpacers();
        
        // Force immediate center positioning
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        
        if (isMobile) {
            // On mobile, use scrollIntoView with center alignment for precise centering
            targetCard.scrollIntoView({ 
                behavior: behavior === 'smooth' ? 'smooth' : 'auto',
                block: 'nearest',
                inline: 'center'
            });
        } else {
            // Desktop: manual calculation
            const targetCardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
            const carouselCenter = carousel.offsetWidth / 2;
            let newScrollLeft = targetCardCenter - carouselCenter;
            newScrollLeft = Math.max(0, Math.min(newScrollLeft, carousel.scrollWidth - carousel.offsetWidth));
            
            if (behavior === 'smooth') {
                carousel.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            } else {
                carousel.scrollLeft = newScrollLeft;
            }
        }
        
        // Double-check centering after scroll completes
        setTimeout(() => {
            if (isMobile) {
                // Force another center scroll if needed
                targetCard.scrollIntoView({ 
                    behavior: 'auto',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }, 300);
    }

    function setActiveCard(index, event, shouldScroll = false, isScrollEventUpdate = false, isInitialSet = false) {
        if (!isScrollEventUpdate) {
            if (isTransitioning) return;
            isTransitioning = true;
        }

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const previousActiveCard = allTeamCards.find(c => c.classList.contains('active')) || null;

        allTeamCards.forEach(card => card.classList.remove('active', 'fading-in', 'fading-out'));
        const targetCard = allTeamCards[index];
        if (!targetCard) {
            isTransitioning = false;
            return;
        }
        targetCard.classList.add('active');

        currentIndex = index;

        if (shouldScroll) {
            isAutoScrolling = true;
            requestAnimationFrame(() => {
                scrollCardIntoCenter(targetCard, isInitialSet ? 'auto' : 'smooth');
                setTimeout(() => { isAutoScrolling = false; isTransitioning = false; }, 400);
            });
        } else {
            isTransitioning = false;
        }
    }

    // Bind click handlers
    allTeamCards.forEach((card, idx) => {
        if (!card.hasAttribute('data-click-bound')) {
            card.setAttribute('data-click-bound', 'true');
            card.addEventListener('click', (event) => {
                if (idx !== currentIndex || !card.classList.contains('active')) {
                    setActiveCard(idx, event, true, false, false);
                }
            });
        }
    });

    // Drag-to-scroll only on desktop
    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    const enableDesktopDrag = () => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            carousel.style.cursor = '';
            carousel.onpointerdown = null;
            carousel.onpointermove = null;
            carousel.onpointerup = null;
            carousel.onpointercancel = null;
            return;
        }
        carousel.onpointerdown = (e) => {
            isPointerDown = true;
            carousel.setPointerCapture(e.pointerId);
            startX = e.clientX;
            startScrollLeft = carousel.scrollLeft;
            carousel.style.cursor = 'grabbing';
        };
        carousel.onpointermove = (e) => {
            if (!isPointerDown) return;
            const dx = e.clientX - startX;
            carousel.scrollLeft = startScrollLeft - dx;
        };
        const endDrag = () => {
            isPointerDown = false;
            carousel.style.cursor = '';
        };
        carousel.onpointerup = endDrag;
        carousel.onpointercancel = endDrag;
    };
    enableDesktopDrag();
    updateSpacers();
    window.addEventListener('resize', enableDesktopDrag);
    window.addEventListener('resize', updateSpacers);

    // Arrows
    const prevBtn = document.querySelector('.team-prev-btn');
    const nextBtn = document.querySelector('.team-next-btn');
    const isMobileForArrows = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobileForArrows && prevBtn && nextBtn) {
        const goPrev = () => {
            const idx = Math.max(0, currentIndex - 1);
            const card = allTeamCards[idx];
            if (card) {
                setActiveCard(idx, null, true, false, false);
            }
        };
        const goNext = () => {
            const idx = Math.min(allTeamCards.length - 1, currentIndex + 1);
            const card = allTeamCards[idx];
            if (card) {
                setActiveCard(idx, null, true, false, false);
            }
        };
        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);
        // Ensure visible on desktop
        prevBtn.style.display = '';
        nextBtn.style.display = '';
        // If using text-only arrows, ensure symbols
        if (!prevBtn.textContent.trim()) prevBtn.textContent = '<';
        if (!nextBtn.textContent.trim()) nextBtn.textContent = '>';
    }

    // Free scroll: update active based on centered card
    let scrollTimer;
    carousel.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const centered = getMostCenteredIndex();
            if (centered !== -1 && centered !== currentIndex) {
                setActiveCard(centered, null, false, true, false);
            }
        }, 80);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!carousel.contains(document.activeElement) && document.activeElement !== document.body) {
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
        }
        if (e.key === 'ArrowLeft') {
            const newIndex = Math.max(0, currentIndex - 1);
            setActiveCard(newIndex, e, true, false, false);
        } else if (e.key === 'ArrowRight') {
            const newIndex = Math.min(allTeamCards.length - 1, currentIndex + 1);
            setActiveCard(newIndex, e, true, false, false);
        }
    });

    // Initial setup
    const initialIndex = bomberCardIndex !== -1 ? bomberCardIndex : 0;
    setActiveCard(initialIndex, null, false, false, true);
    // Center after initial paint
    requestAnimationFrame(() => {
        updateSpacers();
        const target = allTeamCards[initialIndex];
        if (target) scrollCardIntoCenter(target, 'auto');
    });
}

// If Lenis is not managing the page scroll, or for fallback, we might still want to run this
// if team-carousel.js is loaded standalone. However, for this project, it's controlled by index.js.
// document.addEventListener('DOMContentLoaded', initTeamCarousel); 