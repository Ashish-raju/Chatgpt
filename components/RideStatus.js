class RideStatus {
    constructor(app, rideId) {
        this.app = app;
        this.rideId = rideId;
        this.ride = null;
        this.rideListener = null;
        this.map = null;
        this.userLocation = null;
        this.rideMarker = null;
        this.routeLayer = null;
    }

    render() {
        if (!this.ride) {
            return `
                <div class="ride-status loading">
                    <div class="loading-spinner">
                        <i data-feather="loader" class="spinner"></i>
                        <p>Loading ride details...</p>
                    </div>
                </div>
            `;
        }

        const statusInfo = this.getStatusInfo();
        const isRider = this.ride.riderId === this.app.currentUser.uid;

        return `
            <div class="ride-status">
                <div class="ride-status-header">
                    <button class="back-btn" id="back-btn">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <div class="status-indicator ${statusInfo.color}">
                        <i data-feather="${statusInfo.icon}"></i>
                        <span>${statusInfo.text}</span>
                    </div>
                    <button class="menu-btn" id="menu-btn">
                        <i data-feather="more-vertical"></i>
                    </button>
                </div>

                <div class="ride-overview">
                    <div class="ride-route-display">
                        <div class="route-point start">
                            <div class="route-marker">
                                <i data-feather="circle"></i>
                            </div>
                            <div class="route-info">
                                <h4>Pickup</h4>
                                <p>${this.ride.startLocation}</p>
                                <small>${this.formatDepartureTime(this.ride.departureTime)}</small>
                            </div>
                        </div>
                        
                        <div class="route-line">
                            <div class="route-progress" style="height: ${this.getProgressPercentage()}%"></div>
                        </div>
                        
                        ${this.ride.endLocation ? `
                            <div class="route-point end">
                                <div class="route-marker">
                                    <i data-feather="map-pin"></i>
                                </div>
                                <div class="route-info">
                                    <h4>Destination</h4>
                                    <p>${this.ride.endLocation}</p>
                                    <small>ETA: ${this.calculateETA()}</small>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="ride-details-summary">
                        <div class="detail-card">
                            <i data-feather="users"></i>
                            <div>
                                <span class="detail-label">Passengers</span>
                                <span class="detail-value">${this.ride.passengers?.length || 0}/${this.ride.availableSeats}</span>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <i data-feather="dollar-sign"></i>
                            <div>
                                <span class="detail-label">Price</span>
                                <span class="detail-value">$${this.ride.pricePerSeat}</span>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <i data-feather="clock"></i>
                            <div>
                                <span class="detail-label">Duration</span>
                                <span class="detail-value">${this.calculateDuration()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="participants-section">
                    <h3>${isRider ? 'Your Passengers' : 'Ride Participants'}</h3>
                    
                    <div class="participant-list">
                        <!-- Rider -->
                        <div class="participant-card rider-card">
                            <div class="participant-info">
                                <div class="participant-avatar">
                                    <img src="${this.ride.riderPhoto || '/api/placeholder/50/50'}" alt="Rider">
                                    <div class="role-badge rider">
                                        <i data-feather="car"></i>
                                    </div>
                                </div>
                                <div class="participant-details">
                                    <h4>${this.ride.riderName} ${isRider ? '(You)' : ''}</h4>
                                    <p>Driver</p>
                                    <div class="participant-rating">
                                        ${this.renderStars(this.ride.riderRating || 5)}
                                        <span>(${this.ride.riderReviewCount || 0})</span>
                                    </div>
                                </div>
                            </div>
                            ${!isRider ? `
                                <div class="participant-actions">
                                    <button class="icon-btn" title="Call">
                                        <i data-feather="phone"></i>
                                    </button>
                                    <button class="icon-btn" title="Message">
                                        <i data-feather="message-circle"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Passengers -->
                        ${this.ride.passengers?.map(passenger => `
                            <div class="participant-card passenger-card">
                                <div class="participant-info">
                                    <div class="participant-avatar">
                                        <img src="${passenger.photo || '/api/placeholder/50/50'}" alt="Passenger">
                                        <div class="role-badge passenger">
                                            <i data-feather="user"></i>
                                        </div>
                                    </div>
                                    <div class="participant-details">
                                        <h4>${passenger.name} ${passenger.id === this.app.currentUser.uid ? '(You)' : ''}</h4>
                                        <p>Passenger</p>
                                        <div class="participant-rating">
                                            ${this.renderStars(passenger.rating || 5)}
                                            <span>(${passenger.reviewCount || 0})</span>
                                        </div>
                                    </div>
                                </div>
                                ${passenger.id !== this.app.currentUser.uid ? `
                                    <div class="participant-actions">
                                        <button class="icon-btn" title="Call">
                                            <i data-feather="phone"></i>
                                        </button>
                                        <button class="icon-btn" title="Message">
                                            <i data-feather="message-circle"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') || ''}
                        
                        ${this.ride.passengers?.length === 0 ? `
                            <div class="empty-passengers">
                                <i data-feather="users"></i>
                                <p>No passengers yet</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="map-section">
                    <h3>Live Location</h3>
                    <div id="ride-map" class="ride-map"></div>
                </div>

                <div class="ride-actions">
                    ${this.renderActionButtons()}
                </div>

                ${this.ride.notes ? `
                    <div class="ride-notes-section">
                        <h3>Ride Notes</h3>
                        <p>${this.ride.notes}</p>
                    </div>
                ` : ''}

                <!-- Emergency Contact Modal -->
                <div id="emergency-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal emergency-modal">
                        <div class="modal-header">
                            <h2>Emergency</h2>
                            <button class="close-modal" id="close-emergency">
                                <i data-feather="x"></i>
                            </button>
                        </div>
                        
                        <div class="modal-content">
                            <div class="emergency-options">
                                <button class="emergency-btn" id="call-911">
                                    <i data-feather="phone"></i>
                                    <span>Call 911</span>
                                </button>
                                
                                <button class="emergency-btn" id="share-location">
                                    <i data-feather="map-pin"></i>
                                    <span>Share Location</span>
                                </button>
                                
                                <button class="emergency-btn" id="report-issue">
                                    <i data-feather="alert-triangle"></i>
                                    <span>Report Issue</span>
                                </button>
                            </div>
                            
                            <div class="emergency-info">
                                <p>Your safety is our priority. Use these options if you feel unsafe or need immediate assistance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusInfo() {
        const statusMap = {
            'available': { icon: 'clock', text: 'Waiting for pickup', color: 'orange' },
            'matched': { icon: 'users', text: 'Passengers confirmed', color: 'blue' },
            'in_progress': { icon: 'navigation', text: 'Ride in progress', color: 'green' },
            'completed': { icon: 'check-circle', text: 'Ride completed', color: 'green' },
            'cancelled': { icon: 'x-circle', text: 'Ride cancelled', color: 'red' }
        };
        
        return statusMap[this.ride.status] || statusMap.available;
    }

    getProgressPercentage() {
        switch (this.ride.status) {
            case 'available': return 0;
            case 'matched': return 25;
            case 'in_progress': return 50;
            case 'completed': return 100;
            default: return 0;
        }
    }

    calculateETA() {
        if (!this.ride.endLocation) return 'Unknown';
        
        // Simple ETA calculation - in real app, use routing service
        const now = new Date();
        const eta = new Date(now.getTime() + 30 * 60000); // 30 minutes
        
        return eta.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calculateDuration() {
        if (!this.ride.departureTime) return 'Unknown';
        
        // Simple duration calculation
        return '~30 mins';
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
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderActionButtons() {
        const isRider = this.ride.riderId === this.app.currentUser.uid;
        const status = this.ride.status;
        
        if (status === 'completed') {
            return `
                <button class="btn btn-primary" id="rate-ride-btn">
                    <i data-feather="star"></i>
                    Rate This Ride
                </button>
                <button class="btn btn-secondary" id="view-receipt-btn">
                    <i data-feather="file-text"></i>
                    View Receipt
                </button>
            `;
        }
        
        if (status === 'cancelled') {
            return `
                <div class="cancelled-message">
                    <i data-feather="x-circle"></i>
                    <p>This ride has been cancelled</p>
                </div>
            `;
        }
        
        let buttons = '';
        
        if (isRider) {
            if (status === 'available' || status === 'matched') {
                buttons += `
                    <button class="btn btn-primary" id="start-ride-btn">
                        <i data-feather="play"></i>
                        Start Ride
                    </button>
                `;
            } else if (status === 'in_progress') {
                buttons += `
                    <button class="btn btn-success" id="complete-ride-btn">
                        <i data-feather="check"></i>
                        Complete Ride
                    </button>
                `;
            }
            
            if (status !== 'in_progress') {
                buttons += `
                    <button class="btn btn-danger" id="cancel-ride-btn">
                        <i data-feather="x"></i>
                        Cancel Ride
                    </button>
                `;
            }
        } else {
            // Seeker actions
            if (status === 'available' || status === 'matched') {
                buttons += `
                    <button class="btn btn-secondary" id="cancel-booking-btn">
                        <i data-feather="x"></i>
                        Cancel Booking
                    </button>
                `;
            }
        }
        
        buttons += `
            <button class="btn btn-outline emergency-btn" id="emergency-btn">
                <i data-feather="shield"></i>
                Emergency
            </button>
        `;
        
        return buttons;
    }

    async init() {
        await this.loadRideData();
        this.setupRealTimeUpdates();
        this.setupActionButtons();
        this.setupMap();
    }

    async loadRideData() {
        try {
            const rideDoc = await firebase.firestore().collection('rides').doc(this.rideId).get();
            
            if (rideDoc.exists) {
                this.ride = { id: rideDoc.id, ...rideDoc.data() };
                
                // Load rider profile
                const riderProfile = await FirebaseService.getUserProfile(this.ride.riderId);
                if (riderProfile) {
                    this.ride.riderName = riderProfile.name;
                    this.ride.riderPhoto = riderProfile.photos?.[0];
                    this.ride.riderRating = riderProfile.rating;
                    this.ride.riderReviewCount = riderProfile.reviewCount;
                }
                
                // Load passenger profiles
                if (this.ride.passengers && this.ride.passengers.length > 0) {
                    for (let i = 0; i < this.ride.passengers.length; i++) {
                        const passengerId = this.ride.passengers[i];
                        const passengerProfile = await FirebaseService.getUserProfile(passengerId);
                        if (passengerProfile) {
                            this.ride.passengers[i] = {
                                id: passengerId,
                                name: passengerProfile.name,
                                photo: passengerProfile.photos?.[0],
                                rating: passengerProfile.rating,
                                reviewCount: passengerProfile.reviewCount
                            };
                        }
                    }
                }
                
                this.updateDisplay();
            } else {
                this.app.showError('Ride not found');
                this.app.goBack();
            }
        } catch (error) {
            console.error('Error loading ride data:', error);
            this.app.showError('Failed to load ride details');
        }
    }

    setupRealTimeUpdates() {
        this.rideListener = firebase.firestore()
            .collection('rides')
            .doc(this.rideId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    this.ride = { id: doc.id, ...doc.data() };
                    this.updateDisplay();
                }
            });
    }

    updateDisplay() {
        const container = document.getElementById('main-container');
        container.innerHTML = this.render();
        this.setupActionButtons();
        this.setupMap();
        feather.replace();
    }

    setupActionButtons() {
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.app.goBack();
        });
        
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.app.showToast('Menu options coming soon!');
        });
        
        document.getElementById('start-ride-btn')?.addEventListener('click', () => {
            this.startRide();
        });
        
        document.getElementById('complete-ride-btn')?.addEventListener('click', () => {
            this.completeRide();
        });
        
        document.getElementById('cancel-ride-btn')?.addEventListener('click', () => {
            this.cancelRide();
        });
        
        document.getElementById('cancel-booking-btn')?.addEventListener('click', () => {
            this.cancelBooking();
        });
        
        document.getElementById('rate-ride-btn')?.addEventListener('click', () => {
            this.showRatingModal();
        });
        
        document.getElementById('view-receipt-btn')?.addEventListener('click', () => {
            this.viewReceipt();
        });
        
        document.getElementById('emergency-btn')?.addEventListener('click', () => {
            this.showEmergencyModal();
        });
        
        this.setupEmergencyModal();
    }

    async startRide() {
        try {
            await firebase.firestore().collection('rides').doc(this.rideId).update({
                status: 'in_progress',
                startedAt: firebase.firestore.Timestamp.now()
            });
            
            this.app.showSuccess('Ride started!');
        } catch (error) {
            console.error('Error starting ride:', error);
            this.app.showError('Failed to start ride');
        }
    }

    async completeRide() {
        try {
            await firebase.firestore().collection('rides').doc(this.rideId).update({
                status: 'completed',
                completedAt: firebase.firestore.Timestamp.now()
            });
            
            this.app.showSuccess('Ride completed!');
            
            // Navigate to rating screen
            setTimeout(() => {
                this.showRatingModal();
            }, 1000);
            
        } catch (error) {
            console.error('Error completing ride:', error);
            this.app.showError('Failed to complete ride');
        }
    }

    async cancelRide() {
        const confirmed = confirm('Are you sure you want to cancel this ride?');
        if (!confirmed) return;
        
        try {
            await firebase.firestore().collection('rides').doc(this.rideId).update({
                status: 'cancelled',
                cancelledAt: firebase.firestore.Timestamp.now(),
                cancelledBy: this.app.currentUser.uid
            });
            
            this.app.showSuccess('Ride cancelled');
            this.app.goBack();
            
        } catch (error) {
            console.error('Error cancelling ride:', error);
            this.app.showError('Failed to cancel ride');
        }
    }

    async cancelBooking() {
        const confirmed = confirm('Are you sure you want to cancel your booking?');
        if (!confirmed) return;
        
        try {
            // Remove user from passengers list
            const updatedPassengers = this.ride.passengers.filter(p => 
                (typeof p === 'string' ? p : p.id) !== this.app.currentUser.uid
            );
            
            await firebase.firestore().collection('rides').doc(this.rideId).update({
                passengers: updatedPassengers,
                availableSeats: this.ride.availableSeats + 1
            });
            
            this.app.showSuccess('Booking cancelled');
            this.app.goBack();
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.app.showError('Failed to cancel booking');
        }
    }

    showRatingModal() {
        const isRider = this.ride.riderId === this.app.currentUser.uid;
        
        this.app.showModal(`
            <div class="rating-modal">
                <h2>Rate This ${isRider ? 'Passenger' : 'Rider'}</h2>
                <p>How was your experience?</p>
                
                <div class="rating-options">
                    <button class="rating-option" data-rating="date">
                        <i data-feather="heart" class="rating-icon"></i>
                        <span>It's a Date!</span>
                        <small>You'd like to meet again</small>
                    </button>
                    
                    <button class="rating-option" data-rating="ride">
                        <i data-feather="thumbs-up" class="rating-icon"></i>
                        <span>Just a Ride</span>
                        <small>Good experience, just transportation</small>
                    </button>
                </div>
                
                <div class="star-rating">
                    <h3>Rate your experience</h3>
                    <div class="stars">
                        ${[1,2,3,4,5].map(star => `
                            <button class="star-btn" data-star="${star}">
                                <i data-feather="star"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <textarea placeholder="Leave a comment (optional)" id="rating-comment" rows="3"></textarea>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="app.hideModal()">Skip</button>
                    <button class="btn btn-primary" id="submit-rating">Submit Rating</button>
                </div>
            </div>
        `);
        
        this.setupRatingModal();
    }

    setupRatingModal() {
        let selectedRating = null;
        let selectedStars = 0;
        
        document.querySelectorAll('.rating-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.rating-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedRating = btn.dataset.rating;
            });
        });
        
        document.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedStars = parseInt(btn.dataset.star);
                document.querySelectorAll('.star-btn').forEach((starBtn, index) => {
                    starBtn.classList.toggle('selected', index < selectedStars);
                });
            });
        });
        
        document.getElementById('submit-rating').addEventListener('click', async () => {
            if (!selectedRating || selectedStars === 0) {
                this.app.showError('Please select a rating type and star rating');
                return;
            }
            
            await this.submitRating(selectedRating, selectedStars);
        });
    }

    async submitRating(ratingType, stars) {
        try {
            const isRider = this.ride.riderId === this.app.currentUser.uid;
            const comment = document.getElementById('rating-comment').value;
            
            const ratingData = {
                rideId: this.rideId,
                reviewerId: this.app.currentUser.uid,
                revieweeId: isRider ? this.ride.passengers[0] : this.ride.riderId,
                ratingType: ratingType, // 'date' or 'ride'
                stars: stars,
                comment: comment,
                createdAt: firebase.firestore.Timestamp.now()
            };
            
            await firebase.firestore().collection('ride_ratings').add(ratingData);
            
            // Check for mutual "date" rating
            if (ratingType === 'date') {
                const mutualRating = await this.checkMutualDateRating(isRider);
                if (mutualRating) {
                    this.app.showSuccess('Mutual match! Both rated "It\'s a date!"');
                    // Payment is waived for mutual dates
                } else {
                    this.app.showSuccess('Rating submitted!');
                    // Proceed to payment if seeker and not mutual date
                    if (!isRider) {
                        setTimeout(() => {
                            this.app.showPaymentScreen(this.ride);
                        }, 1000);
                    }
                }
            } else {
                this.app.showSuccess('Rating submitted!');
                // Proceed to payment if seeker
                if (!isRider) {
                    setTimeout(() => {
                        this.app.showPaymentScreen(this.ride);
                    }, 1000);
                }
            }
            
            this.app.hideModal();
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.app.showError('Failed to submit rating');
        }
    }

    async checkMutualDateRating(isRider) {
        try {
            const ratingsRef = firebase.firestore().collection('ride_ratings');
            const otherUserQuery = ratingsRef
                .where('rideId', '==', this.rideId)
                .where('reviewerId', '==', isRider ? this.ride.passengers[0] : this.ride.riderId)
                .where('ratingType', '==', 'date');
            
            const snapshot = await otherUserQuery.get();
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking mutual rating:', error);
            return false;
        }
    }

    viewReceipt() {
        this.app.showToast('Receipt feature coming soon!');
    }

    setupEmergencyModal() {
        document.getElementById('close-emergency')?.addEventListener('click', () => {
            document.getElementById('emergency-modal').style.display = 'none';
        });
        
        document.getElementById('call-911')?.addEventListener('click', () => {
            window.location.href = 'tel:911';
        });
        
        document.getElementById('share-location')?.addEventListener('click', () => {
            this.shareLocation();
        });
        
        document.getElementById('report-issue')?.addEventListener('click', () => {
            this.reportIssue();
        });
    }

    showEmergencyModal() {
        document.getElementById('emergency-modal').style.display = 'flex';
    }

    async shareLocation() {
        try {
            const location = await LocationService.getCurrentLocation();
            const locationUrl = `https://maps.google.com?q=${location.lat},${location.lng}`;
            
            if (navigator.share) {
                await navigator.share({
                    title: 'My Current Location - Emergency',
                    text: 'I need help. This is my current location.',
                    url: locationUrl
                });
            } else {
                // Fallback - copy to clipboard
                await navigator.clipboard.writeText(locationUrl);
                this.app.showSuccess('Location copied to clipboard');
            }
        } catch (error) {
            console.error('Error sharing location:', error);
            this.app.showError('Failed to share location');
        }
    }

    reportIssue() {
        this.app.showToast('Issue reporting feature coming soon!');
    }

    async setupMap() {
        try {
            const mapContainer = document.getElementById('ride-map');
            if (!mapContainer) return;
            
            // Get user location
            this.userLocation = await LocationService.getCurrentLocation();
            
            // Initialize map
            mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';
            
            this.map = new mapboxgl.Map({
                container: 'ride-map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [this.userLocation.lng, this.userLocation.lat],
                zoom: 13
            });
            
            // Add markers for ride locations
            if (this.ride.startCoordinates) {
                new mapboxgl.Marker({ color: '#10B981' })
                    .setLngLat([this.ride.startCoordinates.longitude, this.ride.startCoordinates.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <div class="map-popup">
                            <h4>Pickup Location</h4>
                            <p>${this.ride.startLocation}</p>
                        </div>
                    `))
                    .addTo(this.map);
            }
            
            if (this.ride.endCoordinates) {
                new mapboxgl.Marker({ color: '#EF4444' })
                    .setLngLat([this.ride.endCoordinates.longitude, this.ride.endCoordinates.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <div class="map-popup">
                            <h4>Destination</h4>
                            <p>${this.ride.endLocation}</p>
                        </div>
                    `))
                    .addTo(this.map);
            }
            
            // Add user location marker
            new mapboxgl.Marker({ color: '#4F46E5' })
                .setLngLat([this.userLocation.lng, this.userLocation.lat])
                .addTo(this.map);
            
        } catch (error) {
            console.error('Error setting up map:', error);
        }
    }

    destroy() {
        if (this.rideListener) {
            this.rideListener();
        }
        
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}
