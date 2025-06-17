class SwipeInterface {
    constructor(app) {
        this.app = app;
        this.currentIndex = 0;
        this.riders = [];
        this.hammer = null;
        this.isAnimating = false;
    }

    render() {
        return `
            <div class="swipe-interface">
                <div class="swipe-header">
                    <button class="back-btn" id="back-btn">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <h1>Discover Riders</h1>
                    <button class="filter-btn" id="swipe-filter-btn">
                        <i data-feather="sliders"></i>
                    </button>
                </div>

                <div class="swipe-container" id="swipe-container">
                    <div class="cards-stack" id="cards-stack">
                        ${this.riders.length > 0 ? this.renderCards() : this.renderEmptyState()}
                    </div>
                    
                    <div class="swipe-actions" id="swipe-actions" style="display: ${this.riders.length > 0 ? 'flex' : 'none'}">
                        <button class="action-btn pass-btn" id="pass-btn">
                            <i data-feather="x"></i>
                        </button>
                        
                        <button class="action-btn super-like-btn" id="super-like-btn">
                            <i data-feather="star"></i>
                        </button>
                        
                        <button class="action-btn like-btn" id="like-btn">
                            <i data-feather="heart"></i>
                        </button>
                    </div>
                </div>

                <div class="swipe-indicators" id="swipe-indicators">
                    <div class="indicator-item">
                        <i data-feather="x" class="indicator-icon pass"></i>
                        <span>Pass</span>
                    </div>
                    <div class="indicator-item">
                        <i data-feather="star" class="indicator-icon super"></i>
                        <span>Super Like</span>
                    </div>
                    <div class="indicator-item">
                        <i data-feather="heart" class="indicator-icon like"></i>
                        <span>Like</span>
                    </div>
                </div>

                <!-- Match Modal -->
                <div id="match-modal" class="modal-backdrop match-modal-backdrop" style="display: none;">
                    <div class="match-modal">
                        <div class="match-animation">
                            <div class="match-hearts">
                                <i data-feather="heart" class="heart heart-1"></i>
                                <i data-feather="heart" class="heart heart-2"></i>
                                <i data-feather="heart" class="heart heart-3"></i>
                            </div>
                            <h2>It's a Match!</h2>
                            <p>You and <span id="match-rider-name"></span> liked each other</p>
                            
                            <div class="match-profiles">
                                <div class="match-profile">
                                    <img src="${this.app.currentUser.photoURL || '/api/placeholder/80/80'}" alt="You">
                                </div>
                                <div class="match-connector">
                                    <i data-feather="heart"></i>
                                </div>
                                <div class="match-profile" id="match-rider-photo">
                                    <img src="/api/placeholder/80/80" alt="Rider">
                                </div>
                            </div>
                            
                            <div class="match-actions">
                                <button class="btn btn-secondary" id="keep-swiping">
                                    Keep Swiping
                                </button>
                                <button class="btn btn-primary" id="send-message">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile Detail Modal -->
                <div id="profile-detail-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal profile-detail-modal">
                        <div class="modal-header">
                            <button class="close-modal" id="close-profile-detail">
                                <i data-feather="x"></i>
                            </button>
                        </div>
                        
                        <div class="modal-content" id="profile-detail-content">
                            <!-- Profile details will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCards() {
        const cardsToShow = this.riders.slice(this.currentIndex, this.currentIndex + 3);
        
        return cardsToShow.map((rider, index) => `
            <div class="rider-card ${index === 0 ? 'active' : ''}" 
                 data-rider-id="${rider.id}" 
                 data-index="${index}"
                 style="z-index: ${3 - index}; transform: scale(${1 - index * 0.05}) translateY(${index * 10}px)">
                
                <div class="card-photos">
                    <div class="photo-carousel" id="carousel-${rider.id}">
                        ${rider.photos.map((photo, photoIndex) => `
                            <div class="photo-slide ${photoIndex === 0 ? 'active' : ''}"
                                 style="background-image: url('${photo}')">
                            </div>
                        `).join('')}
                    </div>
                    
                    ${rider.photos.length > 1 ? `
                        <div class="photo-indicators">
                            ${rider.photos.map((_, photoIndex) => `
                                <div class="photo-indicator ${photoIndex === 0 ? 'active' : ''}"
                                     data-photo-index="${photoIndex}">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="card-overlay-top">
                        ${rider.isVerified ? '<div class="verified-badge"><i data-feather="check-circle"></i></div>' : ''}
                        <button class="info-btn" data-rider-id="${rider.id}">
                            <i data-feather="info"></i>
                        </button>
                    </div>
                </div>
                
                <div class="card-info">
                    <div class="rider-basic-info">
                        <h3>${rider.name}, ${rider.age}</h3>
                        <div class="rider-rating">
                            ${this.renderStars(rider.rating || 5)}
                            <span>(${rider.reviewCount || 0} reviews)</span>
                        </div>
                    </div>
                    
                    ${rider.bio ? `
                        <div class="rider-bio">
                            <p>${rider.bio}</p>
                        </div>
                    ` : ''}
                    
                    <div class="rider-interests">
                        ${rider.hobbies?.slice(0, 3).map(hobby => `
                            <span class="interest-tag">${hobby}</span>
                        `).join('') || ''}
                    </div>
                    
                    <div class="ride-info">
                        <div class="ride-detail">
                            <i data-feather="map-pin"></i>
                            <span>${rider.currentRide?.startLocation || 'Location flexible'}</span>
                        </div>
                        <div class="ride-detail">
                            <i data-feather="clock"></i>
                            <span>${rider.currentRide ? this.formatDepartureTime(rider.currentRide.departureTime) : 'Time flexible'}</span>
                        </div>
                        <div class="ride-detail">
                            <i data-feather="dollar-sign"></i>
                            <span>${rider.currentRide ? `$${rider.currentRide.pricePerSeat}/seat` : 'Price TBD'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="swipe-overlay swipe-like">
                    <div class="swipe-text">
                        <i data-feather="heart"></i>
                        <span>LIKE</span>
                    </div>
                </div>
                
                <div class="swipe-overlay swipe-pass">
                    <div class="swipe-text">
                        <i data-feather="x"></i>
                        <span>PASS</span>
                    </div>
                </div>
                
                <div class="swipe-overlay swipe-super">
                    <div class="swipe-text">
                        <i data-feather="star"></i>
                        <span>SUPER LIKE</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="swipe-empty-state">
                <div class="empty-icon">
                    <i data-feather="users"></i>
                </div>
                <h3>No more riders</h3>
                <p>You've seen all available riders in your area</p>
                <div class="empty-actions">
                    <button class="btn btn-secondary" id="expand-radius">
                        Expand Search Radius
                    </button>
                    <button class="btn btn-primary" id="check-later">
                        Check Back Later
                    </button>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i data-feather="star" class="star filled"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i data-feather="star" class="star half"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i data-feather="star" class="star"></i>';
        }
        
        return stars;
    }

    formatDepartureTime(timestamp) {
        const date = timestamp.toDate();
        const now = new Date();
        const diffHours = (date - now) / (1000 * 60 * 60);
        
        if (diffHours < 1) {
            return 'Leaving soon';
        } else if (diffHours < 24) {
            return `${Math.round(diffHours)}h from now`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    async init() {
        await this.loadRiders();
        this.setupSwipeGestures();
        this.setupActionButtons();
        this.setupPhotoCarousels();
        this.setupInfoButtons();
        this.setupMatchModal();
    }

    async loadRiders() {
        try {
            const userId = this.app.currentUser.uid;
            
            // Get all available rides
            const ridesRef = firebase.firestore().collection('rides');
            const ridesQuery = ridesRef
                .where('status', '==', 'available')
                .where('riderId', '!=', userId) // Exclude current user
                .where('departureTime', '>', firebase.firestore.Timestamp.now())
                .limit(50);
            
            const ridesSnapshot = await ridesQuery.get();
            const rides = ridesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Get rider profiles
            this.riders = [];
            
            for (const ride of rides) {
                try {
                    const riderProfile = await FirebaseService.getUserProfile(ride.riderId);
                    if (riderProfile) {
                        // Check if already swiped on this rider
                        const hasInteracted = await this.hasAlreadyInteracted(ride.riderId);
                        if (!hasInteracted) {
                            this.riders.push({
                                id: ride.riderId,
                                rideId: ride.id,
                                ...riderProfile,
                                currentRide: ride
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error loading rider profile:', error);
                }
            }
            
            this.updateCardsDisplay();
            
        } catch (error) {
            console.error('Error loading riders:', error);
            this.app.showError('Failed to load riders');
        }
    }

    async hasAlreadyInteracted(riderId) {
        try {
            const interactionsRef = firebase.firestore().collection('swipe_interactions');
            const query = interactionsRef
                .where('seekerId', '==', this.app.currentUser.uid)
                .where('riderId', '==', riderId);
            
            const snapshot = await query.get();
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking interactions:', error);
            return false;
        }
    }

    updateCardsDisplay() {
        const cardsStack = document.getElementById('cards-stack');
        const swipeActions = document.getElementById('swipe-actions');
        
        if (this.currentIndex >= this.riders.length) {
            cardsStack.innerHTML = this.renderEmptyState();
            swipeActions.style.display = 'none';
        } else {
            cardsStack.innerHTML = this.renderCards();
            swipeActions.style.display = 'flex';
            this.setupSwipeGestures();
            this.setupPhotoCarousels();
        }
        
        feather.replace();
    }

    setupSwipeGestures() {
        const activeCard = document.querySelector('.rider-card.active');
        if (!activeCard) return;
        
        // Clean up previous hammer instance
        if (this.hammer) {
            this.hammer.destroy();
        }
        
        this.hammer = new Hammer(activeCard);
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        this.hammer.on('panstart', (e) => {
            if (this.isAnimating) return;
            isDragging = true;
            startX = e.center.x;
            startY = e.center.y;
            activeCard.style.transition = 'none';
        });
        
        this.hammer.on('panmove', (e) => {
            if (this.isAnimating || !isDragging) return;
            
            const deltaX = e.center.x - startX;
            const deltaY = e.center.y - startY;
            const rotation = deltaX * 0.1;
            
            activeCard.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
            
            // Show swipe overlays
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            
            if (absY > absX && deltaY < -100) {
                // Super like (swipe up)
                this.showSwipeOverlay(activeCard, 'super', Math.min(absY / 150, 1));
            } else if (deltaX > 100) {
                // Like (swipe right)
                this.showSwipeOverlay(activeCard, 'like', Math.min(absX / 150, 1));
            } else if (deltaX < -100) {
                // Pass (swipe left)
                this.showSwipeOverlay(activeCard, 'pass', Math.min(absX / 150, 1));
            } else {
                this.hideSwipeOverlays(activeCard);
            }
        });
        
        this.hammer.on('panend', (e) => {
            if (this.isAnimating || !isDragging) return;
            isDragging = false;
            
            const deltaX = e.center.x - startX;
            const deltaY = e.center.y - startY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            
            if (absY > absX && deltaY < -150) {
                // Super like
                this.swipeCard('super');
            } else if (deltaX > 150) {
                // Like
                this.swipeCard('like');
            } else if (deltaX < -150) {
                // Pass
                this.swipeCard('pass');
            } else {
                // Return to center
                this.resetCard(activeCard);
            }
        });
    }

    showSwipeOverlay(card, type, opacity) {
        const overlays = card.querySelectorAll('.swipe-overlay');
        overlays.forEach(overlay => {
            overlay.style.opacity = '0';
        });
        
        const targetOverlay = card.querySelector(`.swipe-${type}`);
        if (targetOverlay) {
            targetOverlay.style.opacity = opacity;
        }
    }

    hideSwipeOverlays(card) {
        const overlays = card.querySelectorAll('.swipe-overlay');
        overlays.forEach(overlay => {
            overlay.style.opacity = '0';
        });
    }

    resetCard(card) {
        card.style.transition = 'transform 0.3s ease-out';
        card.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
        this.hideSwipeOverlays(card);
        
        setTimeout(() => {
            card.style.transition = 'none';
        }, 300);
    }

    setupActionButtons() {
        document.getElementById('back-btn').addEventListener('click', () => {
            this.app.goBack();
        });
        
        document.getElementById('swipe-filter-btn').addEventListener('click', () => {
            this.app.showToast('Filters coming soon!');
        });
        
        document.getElementById('pass-btn').addEventListener('click', () => {
            this.swipeCard('pass');
        });
        
        document.getElementById('super-like-btn').addEventListener('click', () => {
            this.swipeCard('super');
        });
        
        document.getElementById('like-btn').addEventListener('click', () => {
            this.swipeCard('like');
        });
        
        // Empty state buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#expand-radius')) {
                this.app.showToast('Expanding search radius...');
                setTimeout(() => {
                    this.loadRiders();
                }, 1000);
            }
            
            if (e.target.closest('#check-later')) {
                this.app.goBack();
            }
        });
    }

    async swipeCard(action) {
        if (this.isAnimating || this.currentIndex >= this.riders.length) return;
        
        this.isAnimating = true;
        const activeCard = document.querySelector('.rider-card.active');
        const currentRider = this.riders[this.currentIndex];
        
        if (!activeCard || !currentRider) {
            this.isAnimating = false;
            return;
        }
        
        // Animate card out
        activeCard.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        
        let transform = '';
        switch (action) {
            case 'like':
                transform = 'translateX(100vw) rotate(30deg)';
                this.showSwipeOverlay(activeCard, 'like', 1);
                break;
            case 'pass':
                transform = 'translateX(-100vw) rotate(-30deg)';
                this.showSwipeOverlay(activeCard, 'pass', 1);
                break;
            case 'super':
                transform = 'translateY(-100vh) rotate(15deg)';
                this.showSwipeOverlay(activeCard, 'super', 1);
                break;
        }
        
        activeCard.style.transform = transform;
        activeCard.style.opacity = '0';
        
        // Save swipe interaction
        try {
            await this.saveSwipeInteraction(currentRider, action);
            
            // Check for match if liked or super liked
            if (action === 'like' || action === 'super') {
                const isMatch = await this.checkForMatch(currentRider);
                if (isMatch) {
                    setTimeout(() => {
                        this.showMatchModal(currentRider);
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Error saving swipe:', error);
        }
        
        // Move to next card
        setTimeout(() => {
            this.currentIndex++;
            this.updateCardsDisplay();
            this.isAnimating = false;
        }, 600);
    }

    async saveSwipeInteraction(rider, action) {
        const interaction = {
            seekerId: this.app.currentUser.uid,
            riderId: rider.id,
            rideId: rider.rideId,
            action: action, // 'like', 'pass', 'super'
            createdAt: firebase.firestore.Timestamp.now()
        };
        
        await firebase.firestore().collection('swipe_interactions').add(interaction);
    }

    async checkForMatch(rider) {
        try {
            // Check if rider has also expressed interest in seeker
            const interestsRef = firebase.firestore().collection('ride_interests');
            const interestQuery = interestsRef
                .where('rideId', '==', rider.rideId)
                .where('seekerId', '==', this.app.currentUser.uid)
                .where('status', '==', 'accepted'); // Rider accepted the seeker's interest
            
            const snapshot = await interestQuery.get();
            
            if (!snapshot.empty) {
                // Create match
                const matchData = {
                    riderId: rider.id,
                    seekerId: this.app.currentUser.uid,
                    rideId: rider.rideId,
                    createdAt: firebase.firestore.Timestamp.now(),
                    status: 'active'
                };
                
                await firebase.firestore().collection('matches').add(matchData);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking for match:', error);
            return false;
        }
    }

    setupPhotoCarousels() {
        document.querySelectorAll('.rider-card').forEach(card => {
            const photos = card.querySelectorAll('.photo-slide');
            const indicators = card.querySelectorAll('.photo-indicator');
            
            if (photos.length <= 1) return;
            
            let currentPhotoIndex = 0;
            
            // Photo tap navigation
            const carousel = card.querySelector('.photo-carousel');
            carousel.addEventListener('click', (e) => {
                const rect = carousel.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                
                if (clickX > width / 2) {
                    // Next photo
                    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
                } else {
                    // Previous photo
                    currentPhotoIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
                }
                
                this.showPhoto(photos, indicators, currentPhotoIndex);
            });
            
            // Indicator clicks
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentPhotoIndex = index;
                    this.showPhoto(photos, indicators, currentPhotoIndex);
                });
            });
        });
    }

    showPhoto(photos, indicators, index) {
        photos.forEach((photo, i) => {
            photo.classList.toggle('active', i === index);
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    setupInfoButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.info-btn')) {
                const riderId = e.target.closest('.info-btn').dataset.riderId;
                this.showProfileDetail(riderId);
            }
        });
    }

    showProfileDetail(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (!rider) return;
        
        const modal = document.getElementById('profile-detail-modal');
        const content = document.getElementById('profile-detail-content');
        
        content.innerHTML = `
            <div class="profile-detail-header">
                <div class="profile-photos">
                    ${rider.photos.map(photo => `
                        <div class="profile-photo" style="background-image: url('${photo}')"></div>
                    `).join('')}
                </div>
                
                <div class="profile-basic">
                    <h2>${rider.name}, ${rider.age}</h2>
                    <div class="profile-rating">
                        ${this.renderStars(rider.rating || 5)}
                        <span>(${rider.reviewCount || 0} reviews)</span>
                    </div>
                    ${rider.isVerified ? '<div class="verified-status"><i data-feather="check-circle"></i> Verified</div>' : ''}
                </div>
            </div>
            
            <div class="profile-detail-content">
                ${rider.bio ? `
                    <div class="profile-section">
                        <h3>About</h3>
                        <p>${rider.bio}</p>
                    </div>
                ` : ''}
                
                <div class="profile-section">
                    <h3>Interests</h3>
                    <div class="interests-grid">
                        ${rider.hobbies?.map(hobby => `<span class="interest-tag">${hobby}</span>`).join('') || '<p>No interests listed</p>'}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Current Ride</h3>
                    <div class="ride-details">
                        <div class="ride-detail">
                            <i data-feather="map-pin"></i>
                            <span>From: ${rider.currentRide.startLocation}</span>
                        </div>
                        ${rider.currentRide.endLocation ? `
                            <div class="ride-detail">
                                <i data-feather="map-pin"></i>
                                <span>To: ${rider.currentRide.endLocation}</span>
                            </div>
                        ` : ''}
                        <div class="ride-detail">
                            <i data-feather="clock"></i>
                            <span>Departure: ${this.formatDepartureTime(rider.currentRide.departureTime)}</span>
                        </div>
                        <div class="ride-detail">
                            <i data-feather="dollar-sign"></i>
                            <span>Price: $${rider.currentRide.pricePerSeat} per seat</span>
                        </div>
                        <div class="ride-detail">
                            <i data-feather="users"></i>
                            <span>Available seats: ${rider.currentRide.availableSeats}</span>
                        </div>
                    </div>
                </div>
                
                ${rider.currentRide.notes ? `
                    <div class="profile-section">
                        <h3>Ride Notes</h3>
                        <p>${rider.currentRide.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'flex';
        feather.replace();
        
        document.getElementById('close-profile-detail').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    setupMatchModal() {
        document.getElementById('keep-swiping').addEventListener('click', () => {
            this.hideMatchModal();
        });
        
        document.getElementById('send-message').addEventListener('click', () => {
            this.hideMatchModal();
            this.app.showToast('Messaging feature coming soon!');
        });
    }

    showMatchModal(rider) {
        const modal = document.getElementById('match-modal');
        document.getElementById('match-rider-name').textContent = rider.name;
        document.getElementById('match-rider-photo').innerHTML = `
            <img src="${rider.photos[0] || '/api/placeholder/80/80'}" alt="Rider">
        `;
        
        modal.style.display = 'flex';
        
        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
        
        feather.replace();
    }

    hideMatchModal() {
        const modal = document.getElementById('match-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    destroy() {
        if (this.hammer) {
            this.hammer.destroy();
            this.hammer = null;
        }
    }
}
