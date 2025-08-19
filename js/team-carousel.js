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

    // Drag-to-scroll for desktop
    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    carousel.addEventListener('pointerdown', (e) => {
        isPointerDown = true;
        carousel.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startScrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
    });
    carousel.addEventListener('pointermove', (e) => {
        if (!isPointerDown) return;
        const dx = e.clientX - startX;
        carousel.scrollLeft = startScrollLeft - dx;
    });
    const endDrag = () => {
        isPointerDown = false;
        carousel.style.cursor = '';
    };
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);

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
        const target = allTeamCards[initialIndex];
        if (target) scrollCardIntoCenter(target, 'auto');
    });
}

// If Lenis is not managing the page scroll, or for fallback, we might still want to run this
// if team-carousel.js is loaded standalone. However, for this project, it's controlled by index.js.
// document.addEventListener('DOMContentLoaded', initTeamCarousel); 