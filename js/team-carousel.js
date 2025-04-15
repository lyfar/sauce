// Team expandable card carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const teamCards = document.querySelectorAll('.team-card');
    const carousel = document.querySelector('.team-carousel');
    
    if (!teamCards || !carousel || teamCards.length === 0) {
        console.warn('Team carousel elements not found');
        return;
    }

    let currentIndex = 0;

    function setActiveCard(index) {
        // Remove active from all
        teamCards.forEach(card => card.classList.remove('active'));
        // Add active to selected
        const targetCard = teamCards[index];
        targetCard.classList.add('active');
        currentIndex = index;

        // Timeout ensures DOM updates before scroll
        setTimeout(() => {
            targetCard.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }, 10);
    }

    // Card click
    teamCards.forEach((card, idx) => {
        card.addEventListener('click', () => setActiveCard(idx));
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') setActiveCard((currentIndex - 1 + teamCards.length) % teamCards.length);
        if (e.key === 'ArrowRight') setActiveCard((currentIndex + 1) % teamCards.length);
    });

    // Initialize
    setActiveCard(0);
}); 