// Import necessary utilities and modules
import { preloadFonts, preloadImages } from './utils.js'; // Imported utilities
import { Item } from './item.js'; // Imported Item module
import { initTeamCarousel } from './team-carousel.js'; // New: Import the function

// Disable browser's scroll restoration
if ('scrollRestoration' in history) {
	history.scrollRestoration = 'manual';
}

// Variable to store the Lenis smooth scrolling object
let lenis;

// Finding the container element holding background images and extracting those images
const decoEl = document.querySelector('.deco');
const images = [...decoEl.querySelectorAll('.deco__item')];

// Function to initialize video
const initVideo = () => {
	const video = document.querySelector('.lifestyle-video');
	console.log('Looking for video with class: .lifestyle-video');
	
	if (video) {
		console.log('Video found, initializing...');
		
		// Force video to load and play
		video.load();
		
		// Play video after a short delay
		setTimeout(() => {
			const playPromise = video.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					console.log('Auto-play prevented:', error);
				});
			}
		}, 1000);
	} else {
		console.log('Video element not found yet, will try again on assets load');
	}
};

// Finding elements with 'data-text' attribute which are items in your case
const items = [...document.querySelectorAll('[data-text]')];
const ItemsArray = []; // Array to store items

// Function to create items based on 'data-text' attributes
const createItems = () => {
	items.forEach(item => {
		let totalCells; // Variable to store the totalCells value for an item
		const effect = item.dataset.effect; // Get the data-effect attribute of the item

		// Set different totalCells values based on the effect
		switch (effect) {
			case '1':
			case '2':
			case '3':
				totalCells = 4;
				break;
			case '4':
				totalCells = 6;
				break;
			default:
				totalCells = 6; // Default value if no effect matches
				break;
		}

		ItemsArray.push(new Item(item, totalCells)); // Creating an Item instance and storing it in ItemsArray
	});
}

// Initializes Lenis for smooth scrolling with specific properties
const initSmoothScrolling = () => {
	// Force scroll to top on page load
	window.scrollTo(0, 0);
  
	// Instantiate the Lenis object with specified properties
	lenis = new Lenis({
		lerp: 0.075, // Lower value for smoother scrolling
		smoothWheel: true, // Enables smooth scrolling for mouse wheel events
		smoothTouch: true, // Smooth scrolling for touch devices
		wheelMultiplier: 0.8, // Slightly slower wheel scrolling for smoothness
		touchMultiplier: 1.5, // More responsive touch scrolling
		autoResize: true, // Auto resize on window resize
		orientation: 'vertical', // Vertical scroll
		scrollToTop: true, // Scroll to top on page refresh
		gestureOrientation: 'vertical', // Vertical gestures
		normalizeWheel: true, // Normalize wheel behavior
		infinite: false
	});

	// Update ScrollTrigger each time the user scrolls
	lenis.on('scroll', () => ScrollTrigger.update());

	// Define a function to run at each animation frame
	const scrollFn = (time) => {
		lenis.raf(time); // Run Lenis' requestAnimationFrame method
		requestAnimationFrame(scrollFn); // Recursively call scrollFn on each frame
	};
	// Start the animation frame loop
	requestAnimationFrame(scrollFn);
};

// Functions defining different timelines/animations based on effect numbers (fx1Timeline, fx2Timeline, etc.)
const fx1Timeline = item => {
	// Define animations for effectNumber 1
	const itemInner = item.DOM.inner;
	
	const initialValues = {
		x: 13
	};

	gsap.fromTo(itemInner, {
		xPercent: (pos, _, arr) => pos < arr.length/2 ? -initialValues.x*pos-initialValues.x : initialValues.x*(pos-arr.length/2)+initialValues.x,
	}, {
		ease: 'power1',
		xPercent: 0,
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top+=10%',
			scrub: true
		}
	});
}

const fx2Timeline = item => {
	const itemInner = item.DOM.inner;
	const itemInnerWrap = item.DOM.innerWrap;

	const initialValues = {
		x: 30
	};

	gsap.timeline({
		defaults: {
			ease: 'power1'
		},
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top+=10%',
			scrub: true
		}
	})
	.fromTo(itemInner, {
		xPercent: pos => initialValues.x*pos
	}, {
		xPercent: 0
	}, 0)
	.fromTo(itemInnerWrap, {
		xPercent: pos => 2*(pos+1)*10
	}, {
		xPercent: 0
	}, 0);
}

const fx3Timeline = item => {
	const itemInner = item.DOM.inner;
	const itemInnerWrap = item.DOM.innerWrap;
	
	const intervalPixels = 100; // pixel interval
	const totalElements = itemInnerWrap.length;
	// Calculate the total width occupied by all itemInner elements except the last one
	const totalWidth = (totalElements - 1) * intervalPixels;
	// Calculate the offset to center the elements
	const offset = (totalWidth / 2) * -1;

	const initialValues = {
		x: 30,
		y: -15,
		rotation: -5
	};

	gsap.timeline({
		defaults: {
			ease: 'power1',
		},
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top+=10%',
			scrub: true
		}
	})
	.fromTo(itemInner, {
		xPercent: (pos, _, arr) => pos < arr.length/2 ? -initialValues.x*pos-initialValues.x : initialValues.x*(pos-arr.length/2)+initialValues.x,
		yPercent: (pos, _, arr) => pos < arr.length/2 ? initialValues.y*(arr.length/2-pos) : initialValues.y*((pos+1)-arr.length/2),
	}, {
		xPercent: 0,
		yPercent: 0
	}, 0)

	.fromTo(itemInnerWrap, {	
		xPercent: pos => {
			const distanceFromCenter = pos * intervalPixels;
			const xPercent = distanceFromCenter + offset;
			return xPercent;
		},		
		rotationZ: (pos, _, arr) => pos < arr.length/2 ? -initialValues.rotation*(arr.length/2-pos)-initialValues.rotation : initialValues.rotation*(pos-arr.length/2)+initialValues.rotation
	}, {
		xPercent: 0,
		rotationZ: 0
	}, 0);
}

const fx4Timeline = item => {
	const itemInner = item.DOM.inner;
	const itemInnerWrap = item.DOM.innerWrap;
	
	const intervalPixels = 100; // pixel interval
	const totalElements = itemInnerWrap.length;
	// Calculate the total width occupied by all itemInner elements except the last one
	const totalWidth = (totalElements - 1) * intervalPixels;
	// Calculate the offset to center the elements
	const offset = (totalWidth / 2) * -1;

	const initialValues = {
		x: 50
	};
	
	gsap.timeline({
		defaults: {
			ease: 'power1',
		},
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom+=30%',
			end: 'top top+=10%',
			scrub: true
		}
	})
	.fromTo(itemInner, {
		xPercent: (pos, _, arr) => pos < arr.length/2 ? -initialValues.x*pos-initialValues.x : initialValues.x*(pos-arr.length/2)+initialValues.x,
		//filter: 'blur(15px)'
	}, {
		xPercent: 0,
		//filter: 'blur(0px)'
	}, 0)
	.fromTo(itemInner, {
		scaleX: 1.5,
		scaleY: 0,
		transformOrigin: '50% 0%'
	}, {
		ease: 'power2.inOut',
		scaleX: 1,
		scaleY: 1
	}, 0)
	.fromTo(itemInnerWrap, {			
		xPercent: pos => {
			const distanceFromCenter = pos * intervalPixels;
			const xPercent = distanceFromCenter + offset;
			return xPercent;
		},
	}, {
		xPercent: 0,
		stagger: {
			amount: 0.07,
			from: 'center'
		}
	}, 0);
}

const fx5Timeline = item => {
	const itemInner = item.DOM.inner;
	
	const initialValues = {
		x: 20
	};
	
	gsap.timeline({
		defaults: {
			ease: 'power1',
		},
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top+=10%',
			scrub: true
		}
	})
	.fromTo(itemInner, {
		xPercent: (pos, _, arr) => pos < arr.length/2 ? -initialValues.x*pos-initialValues.x : initialValues.x*(pos-arr.length/2)+initialValues.x,
		yPercent: (pos, _, arr) => pos%2 === 0 ? -40 : 40,
	}, {
		xPercent: 0,
		yPercent: 0
	}, 0);
}

const fx6Timeline = item => {
	// Define animations for effectNumber 1
	const itemInner = item.DOM.inner;
	const itemInnerWrap = item.DOM.innerWrap;

	const initialValues = {
		x: 6
	};
	
	gsap.timeline({
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top',
			scrub: true
		}
	})
	.fromTo(itemInner, {
		xPercent: (pos,_,arr) => (arr.length-pos-1)*-initialValues.x-initialValues.x,
	}, {
		ease: 'power1',
		xPercent: 0
	}, 0)
	.fromTo(itemInnerWrap, {			
		yPercent: pos => pos*20
	}, {
		yPercent: 0
	}, 0);
}

const defaultTimeline = item => {
	// Define animations for effectNumber 1
	const itemInner = item.DOM.inner;
	
	const initialValues = {
		x: 10
	};
	
	gsap.fromTo(itemInner, {
		xPercent: (pos, _, arr) => pos < arr.length/2 ? pos*-initialValues.x-initialValues.x : (pos-arr.length/2)*initialValues.x+initialValues.x,
	}, {
		ease: 'power1',
		xPercent: 0,
		scrollTrigger: {
			trigger: item.DOM.el,
			start: 'top bottom',
			end: 'top top+=10%',
			scrub: true
		}
	});
}

// Function to create animations for images triggered by scrolling
const fxImagesTimeline = () => {
	images.forEach(image => {
		gsap.fromTo(image, {
			transformOrigin: '800% 50%',
			rotationZ: -8
		}, {
			ease: 'power1',
			rotationZ: 5,
			scrollTrigger: {
				trigger: image,
				start: 'top bottom',
				end: 'top top+=10%',
				scrub: true
			}
		});
	});
}

// Function to apply scroll-triggered animations to items
const scroll = () => {
	for (let i = 0, length = ItemsArray.length; i <= length-1; ++i ) {
		const item = ItemsArray[i];
		
		// Effect number passed in data-effect
		const effect = item.DOM.el.dataset.effect; // Get the data-effect attribute
		// Apply different timelines based on the effect number using switch statements
		switch ( effect ) {
			case '1':
				fx1Timeline(item);
				break;
			case '2':
				fx2Timeline(item);
				break;
			case '3':
				fx3Timeline(item);
				break;
			case '4':
				fx4Timeline(item);
				break;
			case '5':
				fx5Timeline(item);
				break;
			case '6':
				fx6Timeline(item);
				break;
			default:
				// Set a default timeline in case no matching effect is found
				defaultTimeline(item);
				break;
		}
	}
	// Apply image animations triggered by scrolling
	fxImagesTimeline();
}

// Function to initialize animations
const init = () => {
	// Force scroll to top on page load
	window.scrollTo(0, 0);
	
	// Preload images
	Promise.all([preloadImages('.deco__item'), preloadFonts('ejh4sem')]).then(() => {
		// Remove loading class
		document.body.classList.remove('loading');
		
		// Initialize smooth scrolling (Lenis)
		initSmoothScrolling(); // Lenis also does a scrollTo(0,0) internally initially
		
		// Create items
		createItems();
		
		// Initialize video
		initVideo();
		
		// Initialize scroll animations
		scroll();

		// Initialize the team carousel AFTER Lenis and preloading
		initTeamCarousel();
	});
};

init();