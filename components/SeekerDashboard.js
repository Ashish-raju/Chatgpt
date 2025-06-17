class SeekerDashboard {
    constructor(app) {
        this.app = app;
        this.activeTab = 'map';
        this.map = null;
        this.userLocation = null;
        this.searchRadius = 10; // kilometers
        this.availableRides = [];
        this.rideMarkers = [];
        this.currentFilter = 'all';
    }

    render() {
        return `
            <div class="seeker-dashboard">
                <div class="dashboard-header">
                    <div class="user-info">
                        <div class="user-avatar">
                            <img src="${this.app.currentUser.photoURL || '/api/placeholder/40/40'}" alt="Profile">
                        </div>
                        <div class="user-details">
                            <h2>Find Your Ride</h2>
                            <p>Discover rides and connect</p>
                        </div>
                    </div>
                    
                    <div class="header-actions">
                        <button class="icon-btn" id="search-btn">
                            <i data-feather="search"></i>
                        </button>
                        <button class="icon-btn" id="filter-btn">
                            <i data-feather="filter"></i>
                        </button>
                        <button class="icon-btn" id="notifications-btn">
                            <i data-feather="bell"></i>
                            <span class="notification-badge">1</span>
                        </button>
                        <button class="icon-btn" id="profile-btn">
                            <i data-feather="user"></i>
                        </button>
                    </div>
                </div>

                <div class="search-controls">
                    <div class="location-search">
                        <div class="search-input-group">
                            <i data-feather="map-pin"></i>
                            <input type="text" id="destination-input" placeholder="Where do you want to go?">
                            <button class="search-submit" id="search-rides-btn">
                                <i data-feather="arrow-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="radius-control">
                        <label>Search radius: <span id="radius-value">${this.searchRadius}</span> km</label>
                        <input type="range" id="radius-slider" min="1" max="50" value="${this.searchRadius}" class="radius-slider">
                    </div>
                </div>

                <div class="dashboard-tabs">
                    <button class="tab-btn ${this.activeTab === 'map' ? 'active' : ''}" data-tab="map">
                        <i data-feather="map"></i>
                        <span>Map</span>
                    </button>
                    <button class="tab-btn ${this.activeTab === 'list' ? 'active' : ''}" data-tab="list">
                        <i data-feather="list"></i>
                        <span>List</span>
                    </button>
                    <button class="tab-btn ${this.activeTab === 'matches' ? 'active' : ''}" data-tab="matches">
                        <i data-feather="heart"></i>
                        <span>Matches</span>
                    </button>
                    <button class="tab-btn ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">
                        <i data-feather="clock"></i>
                        <span>History</span>
                    </button>
                </div>

                <div class="dashboard-content">
                    <div id="map-tab" class="tab-content ${this.activeTab === 'map' ? 'active' : ''}">
                        <div id="map-container" class="map-container">
                            <div id="seeker-map" class="map"></div>
                            <div class="map-controls">
                                <button class="map-control-btn" id="center-location">
                                    <i data-feather="crosshair"></i>
                                </button>
                                <button class="map-control-btn" id="refresh-rides">
                                    <i data-feather="refresh-cw"></i>
                                </button>
                            </div>
                            <div class="rides-counter">
                                <span id="rides-count">${this.availableRides.length}</span> rides found
                            </div>
                        </div>
                    </div>

                    <div id="list-tab" class="tab-content ${this.activeTab === 'list' ? 'active' : ''}">
                        <div class="rides-list-container">
                            <div class="list-filters">
                                <button class="filter-chip ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                                    All Rides
                                </button>
                                <button class="filter-chip ${this.currentFilter === 'soon' ? 'active' : ''}" data-filter="soon">
                                    Leaving Soon
                                </button>
                                <button class="filter-chip ${this.currentFilter === 'cheap' ? 'active' : ''}" data-filter="cheap">
                                    Budget Friendly
                                </button>
                            </div>
                            
                            <div id="rides-list" class="rides-list">
                                ${this.renderRidesList()}
                            </div>
                        </div>
                    </div>

                    <div id="matches-tab" class="tab-content ${this.activeTab === 'matches' ? 'active' : ''}">
                        <div class="matches-container">
                            <h3>Your Matches</h3>
                            <div id="matches-list" class="matches-list">
                                <div class="empty-state">
                                    <i data-feather="heart"></i>
                                    <h4>No matches yet</h4>
                                    <p>Start swiping on riders to find your match</p>
                                    <button class="btn btn-primary" id="start-swiping">
                                        Start Swiping
                                        <i data-feather="arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="history-tab" class="tab-content ${this.activeTab === 'history' ? 'active' : ''}">
                        <div class="history-container">
                            <h3>Ride History</h3>
                            <div id="history-list" class="history-list">
                                <div class="empty-state">
                                    <i data-feather="clock"></i>
                                    <h4>No rides yet</h4>
                                    <p>Your completed rides will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter Modal -->
                <div id="filter-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal filter-modal">
                        <div class="modal-header">
                            <h2>Filter Rides</h2>
                            <button class="close-modal" id="close-filter">
                                <i data-feather="x"></i>
                            </button>
                        </div>
                        
                        <div class="modal-content">
                            <div class="filter-section">
                                <h3>Price Range</h3>
                                <div class="price-range">
                                    <input type="range" id="min-price" min="0" max="100" value="0">
                                    <input type="range" id="max-price" min="0" max="100" value="50">
                                    <div class="price-labels">
                                        <span>$<span id="min-price-label">0</span></span>
                                        <span>$<span id="max-price-label">50</span></span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h3>Departure Time</h3>
                                <select id="time-filter">
                                    <option value="any">Any time</option>
                                    <option value="1hour">Within 1 hour</option>
                                    <option value="3hours">Within 3 hours</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                </select>
                            </div>
                            
                            <div class="filter-section">
                                <h3>Rider Preferences</h3>
                                <div class="preference-tags">
                                    <label class="tag-checkbox">
                                        <input type="checkbox" value="verified">
                                        <span>Verified riders only</span>
                                    </label>
                                    <label class="tag-checkbox">
                                        <input type="checkbox" value="high-rated">
                                        <span>High rated (4.5+)</span>
                                    </label>
                                    <label class="tag-checkbox">
                                        <input type="checkbox" value="non-smoker">
                                        <span>Non-smoker</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="modal-actions">
                                <button class="btn btn-secondary" id="clear-filters">
                                    Clear All
                                </button>
                                <button class="btn btn-primary" id="apply-filters">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRidesList() {
        if (this.availableRides.length === 0) {
            return `
                <div class="empty-state">
                    <i data-feather="map"></i>
                    <h4>No rides found</h4>
                    <p>Try adjusting your search location or radius</p>
                    <button class="btn btn-primary" id="expand-search">
                        Expand Search
                    </button>
                </div>
            `;
        }

        return this.availableRides.map(ride => `
            <div class="ride-card" data-ride-id="${ride.id}">
                <div class="ride-header">
                    <div class="rider-info">
                        <div class="rider-avatar">
                            <img src="${ride.riderPhoto || '/api/placeholder/50/50'}" alt="Rider">
                            ${ride.isVerified ? '<div class="verified-badge"><i data-feather="check-circle"></i></div>' : ''}
                        </div>
                        <div class="rider-details">
                            <h4>${ride.riderName}</h4>
                            <div class="rider-rating">
                                ${this.renderStars(ride.rating || 5)}
                                <span>(${ride.reviewCount || 0})</span>
                            </div>
                        </div>
                    </div>
                    <div class="ride-price">
                        <span class="price">$${ride.pricePerSeat}</span>
                        <span class="per-seat">per seat</span>
                    </div>
                </div>
                
                <div class="ride-route">
                    <div class="route-point">
                        <i data-feather="circle" class="route-icon start"></i>
                        <span>${ride.startLocation}</span>
                    </div>
                    <div class="route-line"></div>
                    <div class="route-point">
                        <i data-feather="map-pin" class="route-icon end"></i>
                        <span>${ride.endLocation || 'Flexible destination'}</span>
                    </div>
                </div>
                
                <div class="ride-details">
                    <div class="detail-item">
                        <i data-feather="clock"></i>
                        <span>${this.formatDepartureTime(ride.departureTime)}</span>
                    </div>
                    <div class="detail-item">
                        <i data-feather="users"></i>
                        <span>${ride.availableSeats} seat${ride.availableSeats > 1 ? 's' : ''} available</span>
                    </div>
                    <div class="detail-item">
                        <i data-feather="map"></i>
                        <span>${this.calculateDistance(ride)} km away</span>
                    </div>
                </div>
                
                ${ride.notes ? `
                    <div class="ride-notes">
                        <p>${ride.notes}</p>
                    </div>
                ` : ''}
                
                <div class="ride-actions">
                    <button class="btn btn-secondary btn-sm" onclick="app.showSwipeInterface()">
                        <i data-feather="eye"></i>
                        View Profile
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="express-interest">
                        <i data-feather="heart"></i>
                        Express Interest
                    </button>
                </div>
            </div>
        `).join('');
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

    calculateDistance(ride) {
        if (!this.userLocation || !ride.startCoordinates) return 0;
        
        return LocationService.calculateDistance(
            this.userLocation.lat,
            this.userLocation.lng,
            ride.startCoordinates.latitude,
            ride.startCoordinates.longitude
        ).toFixed(1);
    }

    async init() {
        this.setupTabs();
        this.setupControls();
        this.setupFilters();
        await this.loadUserLocation();
        await this.loadAvailableRides();
        this.setupMap();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
        
        // Load tab-specific content
        if (tab === 'map' && !this.map) {
            setTimeout(() => this.initMap(), 100);
        } else if (tab === 'matches') {
            this.loadMatches();
        } else if (tab === 'history') {
            this.loadHistory();
        }
    }

    setupControls() {
        // Header actions
        document.getElementById('search-btn').addEventListener('click', () => {
            document.getElementById('destination-input').focus();
        });
        
        document.getElementById('filter-btn').addEventListener('click', () => {
            this.showFilterModal();
        });
        
        document.getElementById('notifications-btn').addEventListener('click', () => {
            this.showNotifications();
        });
        
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showProfile();
        });
        
        // Search controls
        document.getElementById('search-rides-btn').addEventListener('click', () => {
            this.searchRides();
        });
        
        document.getElementById('destination-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchRides();
            }
        });
        
        // Radius control
        const radiusSlider = document.getElementById('radius-slider');
        radiusSlider.addEventListener('input', (e) => {
            this.searchRadius = parseInt(e.target.value);
            document.getElementById('radius-value').textContent = this.searchRadius;
            this.loadAvailableRides();
        });
        
        // List actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="express-interest"]')) {
                const rideCard = e.target.closest('.ride-card');
                const rideId = rideCard.dataset.rideId;
                this.expressInterest(rideId);
            }
        });
        
        // Filter chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-chip')) {
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterRides();
            }
        });
        
        // Start swiping button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#start-swiping')) {
                this.app.showSwipeInterface();
            }
        });
    }

    setupFilters() {
        const filterModal = document.getElementById('filter-modal');
        
        document.getElementById('close-filter').addEventListener('click', () => {
            this.hideFilterModal();
        });
        
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Price range sliders
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        
        minPrice.addEventListener('input', (e) => {
            document.getElementById('min-price-label').textContent = e.target.value;
        });
        
        maxPrice.addEventListener('input', (e) => {
            document.getElementById('max-price-label').textContent = e.target.value;
        });
    }

    async loadUserLocation() {
        try {
            this.userLocation = await LocationService.getCurrentLocation();
        } catch (error) {
            console.error('Error getting user location:', error);
            this.app.showError('Unable to get your location. Please enable location services.');
        }
    }

    async loadAvailableRides() {
        try {
            if (!this.userLocation) {
                await this.loadUserLocation();
            }
            
            const ridesRef = firebase.firestore().collection('rides');
            const now = firebase.firestore.Timestamp.now();
            
            // Query for available rides
            const ridesQuery = ridesRef
                .where('status', '==', 'available')
                .where('departureTime', '>', now)
                .orderBy('departureTime')
                .limit(50);
            
            const snapshot = await ridesQuery.get();
            const allRides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter by distance
            this.availableRides = [];
            
            for (const ride of allRides) {
                if (ride.startCoordinates && this.userLocation) {
                    const distance = LocationService.calculateDistance(
                        this.userLocation.lat,
                        this.userLocation.lng,
                        ride.startCoordinates.latitude,
                        ride.startCoordinates.longitude
                    );
                    
                    if (distance <= this.searchRadius) {
                        // Get rider profile
                        const riderProfile = await FirebaseService.getUserProfile(ride.riderId);
                        ride.riderName = riderProfile?.name || 'Unknown';
                        ride.riderPhoto = riderProfile?.photos?.[0];
                        ride.isVerified = riderProfile?.isVerified || false;
                        ride.rating = riderProfile?.rating || 5;
                        ride.reviewCount = riderProfile?.reviewCount || 0;
                        
                        this.availableRides.push(ride);
                    }
                }
            }
            
            this.updateRidesDisplay();
            
        } catch (error) {
            console.error('Error loading rides:', error);
            this.app.showError('Failed to load available rides');
        }
    }

    updateRidesDisplay() {
        // Update list view
        const ridesList = document.getElementById('rides-list');
        if (ridesList) {
            ridesList.innerHTML = this.renderRidesList();
            feather.replace();
        }
        
        // Update map markers
        if (this.map) {
            this.updateMapMarkers();
        }
        
        // Update counter
        const ridesCount = document.getElementById('rides-count');
        if (ridesCount) {
            ridesCount.textContent = this.availableRides.length;
        }
    }

    async searchRides() {
        const destination = document.getElementById('destination-input').value.trim();
        
        if (!destination) {
            this.app.showError('Please enter a destination');
            return;
        }
        
        try {
            // Geocode destination
            const destCoords = await LocationService.geocode(destination);
            
            // Update user location to destination for search
            this.userLocation = { lat: destCoords.lat, lng: destCoords.lng };
            
            // Reload rides based on new location
            await this.loadAvailableRides();
            
            // Center map on destination if map is active
            if (this.map && this.activeTab === 'map') {
                this.map.flyTo({
                    center: [destCoords.lng, destCoords.lat],
                    zoom: 14
                });
            }
            
        } catch (error) {
            console.error('Error searching rides:', error);
            this.app.showError('Failed to search for rides at that location');
        }
    }

    filterRides() {
        // This would filter the rides based on current filter
        // For now, just update display
        this.updateRidesDisplay();
    }

    async expressInterest(rideId) {
        try {
            const ride = this.availableRides.find(r => r.id === rideId);
            if (!ride) return;
            
            // Save interest to Firestore
            await firebase.firestore().collection('ride_interests').add({
                rideId: rideId,
                riderId: ride.riderId,
                seekerId: this.app.currentUser.uid,
                createdAt: firebase.firestore.Timestamp.now(),
                status: 'pending'
            });
            
            this.app.showSuccess('Interest expressed! The rider will be notified.');
            
        } catch (error) {
            console.error('Error expressing interest:', error);
            this.app.showError('Failed to express interest');
        }
    }

    setupMap() {
        if (this.activeTab === 'map') {
            setTimeout(() => this.initMap(), 100);
        }
    }

    async initMap() {
        try {
            const mapContainer = document.getElementById('seeker-map');
            if (!mapContainer || this.map) return;
            
            if (!this.userLocation) {
                await this.loadUserLocation();
            }
            
            // Initialize Mapbox map
            mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';
            
            this.map = new mapboxgl.Map({
                container: 'seeker-map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [this.userLocation.lng, this.userLocation.lat],
                zoom: 12
            });
            
            // Add user location marker
            new mapboxgl.Marker({ color: '#4F46E5' })
                .setLngLat([this.userLocation.lng, this.userLocation.lat])
                .addTo(this.map);
            
            // Add ride markers
            this.updateMapMarkers();
            
            // Setup map controls
            this.setupMapControls();
            
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('seeker-map').innerHTML = `
                <div class="map-error">
                    <i data-feather="map-pin"></i>
                    <p>Unable to load map. Please check your connection.</p>
                </div>
            `;
            feather.replace();
        }
    }

    updateMapMarkers() {
        if (!this.map) return;
        
        // Clear existing markers
        this.rideMarkers.forEach(marker => marker.remove());
        this.rideMarkers = [];
        
        // Add new markers for available rides
        this.availableRides.forEach(ride => {
            if (ride.startCoordinates) {
                const marker = new mapboxgl.Marker({ color: '#10B981' })
                    .setLngLat([ride.startCoordinates.longitude, ride.startCoordinates.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <div class="ride-popup">
                            <div class="popup-header">
                                <img src="${ride.riderPhoto || '/api/placeholder/40/40'}" alt="Rider">
                                <div>
                                    <h4>${ride.riderName}</h4>
                                    <p>$${ride.pricePerSeat}/seat</p>
                                </div>
                            </div>
                            <p><strong>From:</strong> ${ride.startLocation}</p>
                            ${ride.endLocation ? `<p><strong>To:</strong> ${ride.endLocation}</p>` : ''}
                            <p><strong>Departure:</strong> ${this.formatDepartureTime(ride.departureTime)}</p>
                            <button class="btn btn-sm btn-primary" onclick="app.currentComponent.expressInterest('${ride.id}')">
                                Express Interest
                            </button>
                        </div>
                    `))
                    .addTo(this.map);
                
                this.rideMarkers.push(marker);
            }
        });
    }

    setupMapControls() {
        document.getElementById('center-location').addEventListener('click', () => {
            if (this.map && this.userLocation) {
                this.map.flyTo({
                    center: [this.userLocation.lng, this.userLocation.lat],
                    zoom: 14
                });
            }
        });
        
        document.getElementById('refresh-rides').addEventListener('click', () => {
            this.loadAvailableRides();
        });
    }

    showFilterModal() {
        document.getElementById('filter-modal').style.display = 'flex';
    }

    hideFilterModal() {
        document.getElementById('filter-modal').style.display = 'none';
    }

    clearFilters() {
        document.getElementById('min-price').value = 0;
        document.getElementById('max-price').value = 50;
        document.getElementById('time-filter').value = 'any';
        document.querySelectorAll('.tag-checkbox input').forEach(cb => cb.checked = false);
        document.getElementById('min-price-label').textContent = '0';
        document.getElementById('max-price-label').textContent = '50';
    }

    applyFilters() {
        // Apply filters and reload rides
        this.hideFilterModal();
        this.loadAvailableRides();
    }

    async loadMatches() {
        try {
            const userId = this.app.currentUser.uid;
            const matchesRef = firebase.firestore().collection('matches');
            const matchesQuery = matchesRef.where('seekerId', '==', userId);
            
            const snapshot = await matchesQuery.get();
            const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            this.renderMatches(matches);
        } catch (error) {
            console.error('Error loading matches:', error);
        }
    }

    renderMatches(matches) {
        const container = document.getElementById('matches-list');
        
        if (matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-feather="heart"></i>
                    <h4>No matches yet</h4>
                    <p>Start swiping on riders to find your match</p>
                    <button class="btn btn-primary" id="start-swiping">
                        Start Swiping
                        <i data-feather="arrow-right"></i>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = matches.map(match => `
                <div class="match-card" data-match-id="${match.id}">
                    <div class="match-avatar">
                        <img src="${match.riderPhoto || '/api/placeholder/60/60'}" alt="Rider">
                    </div>
                    <div class="match-info">
                        <h4>${match.riderName}</h4>
                        <p>Mutual match • ${this.app.formatDate(match.createdAt)}</p>
                        <div class="match-badges">
                            ${match.bothSwipedDate ? '<span class="badge badge-heart">Both swiped date!</span>' : ''}
                        </div>
                    </div>
                    <div class="match-actions">
                        <button class="btn btn-sm btn-primary">
                            <i data-feather="message-circle"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        feather.replace();
    }

    async loadHistory() {
        // Load ride history
        const container = document.getElementById('history-list');
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="clock"></i>
                <h4>No rides yet</h4>
                <p>Your completed rides will appear here</p>
            </div>
        `;
        feather.replace();
    }

    showNotifications() {
        this.app.showToast('Notifications feature coming soon!');
    }

    showProfile() {
        this.app.showToast('Profile feature coming soon!');
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        this.rideMarkers.forEach(marker => marker.remove());
        this.rideMarkers = [];
    }
}
