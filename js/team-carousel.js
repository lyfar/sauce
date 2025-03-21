// Team expandable card carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const teamCards = document.querySelectorAll('.team-card');
    const prevBtn = document.querySelector('.team-prev-btn');
    const nextBtn = document.querySelector('.team-next-btn');
    let activeCardIndex = 0; // Start with the first card active
    
    // Function to make a specific card active and scroll to it
    function setActiveCard(index) {
        // Save scroll position to prevent heading jump
        const scrollPosition = window.scrollY;
        
        // Remove active class from all cards
        teamCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to the selected card
        teamCards[index].classList.add('active');
        
        // Scroll to the active card smoothly, but only horizontally
        const carouselElement = document.querySelector('.team-carousel');
        
        // Get card dimensions after adding the active class
        // Small delay to ensure the active class has been applied and card dimensions updated
        setTimeout(() => {
            // Calculate center position regardless of direction
            const cardCenterOffset = teamCards[index].offsetLeft + (teamCards[index].offsetWidth / 2);
            const carouselCenter = carouselElement.offsetWidth / 2;
            
            carouselElement.scrollTo({
                left: cardCenterOffset - carouselCenter,
                behavior: 'smooth'
            });
            
            // Restore vertical scroll position to prevent content jump
            window.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
            });
        }, 10);
        
        // Update the active index
        activeCardIndex = index;
    }
    
    // Add click event for each card
    teamCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            setActiveCard(index);
        });
    });
    
    // Navigation button click events (keeping for functionality even though buttons are hidden)
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            let newIndex = activeCardIndex - 1;
            if (newIndex < 0) {
                newIndex = teamCards.length - 1; // Loop to the end
            }
            setActiveCard(newIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            let newIndex = activeCardIndex + 1;
            if (newIndex >= teamCards.length) {
                newIndex = 0; // Loop to the beginning
            }
            setActiveCard(newIndex);
        });
    }
    
    // Touch swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carousel = document.querySelector('.team-carousel');
    
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Detect swipe direction and use threshold
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            // Determine direction and calculate new index
            if (swipeDistance < 0) {
                // Swiped left - go forward
                let newIndex = activeCardIndex + 1;
                if (newIndex >= teamCards.length) {
                    newIndex = 0;
                }
                setActiveCard(newIndex);
            } else {
                // Swiped right - go backward
                let newIndex = activeCardIndex - 1;
                if (newIndex < 0) {
                    newIndex = teamCards.length - 1;
                }
                setActiveCard(newIndex);
            }
        }
    }
    
    // Auto-rotation functionality
    let autoRotateTimer;
    
    function startAutoRotate() {
        autoRotateTimer = setInterval(() => {
            let newIndex = activeCardIndex + 1;
            if (newIndex >= teamCards.length) {
                newIndex = 0;
            }
            setActiveCard(newIndex);
        }, 5000); // Change card every 5 seconds
    }
    
    function stopAutoRotate() {
        clearInterval(autoRotateTimer);
    }
    
    // Start auto-rotation
    startAutoRotate();
    
    // Pause auto-rotation when hovering over the carousel
    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', startAutoRotate);
    
    // Also pause on touch for mobile devices
    carousel.addEventListener('touchstart', stopAutoRotate);
    carousel.addEventListener('touchend', startAutoRotate);
    
    // Make sure carousel can be navigated with keyboard
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            let newIndex = activeCardIndex - 1;
            if (newIndex < 0) {
                newIndex = teamCards.length - 1;
            }
            setActiveCard(newIndex);
        } else if (e.key === 'ArrowRight') {
            let newIndex = activeCardIndex + 1;
            if (newIndex >= teamCards.length) {
                newIndex = 0;
            }
            setActiveCard(newIndex);
        }
    });
    
    // Ensure proper centering on window resize
    window.addEventListener('resize', () => {
        setActiveCard(activeCardIndex);
    });
    
    // Initialize the first card as active
    setActiveCard(0);
}); 