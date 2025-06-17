class RiderDashboard {
    constructor(app) {
        this.app = app;
        this.currentRide = null;
        this.activeTab = 'map';
        this.map = null;
        this.userLocation = null;
        this.rideMarker = null;
    }

    render() {
        return `
            <div class="rider-dashboard">
                <div class="dashboard-header">
                    <div class="user-info">
                        <div class="user-avatar">
                            <img src="${this.app.currentUser.photoURL || '/api/placeholder/40/40'}" alt="Profile">
                        </div>
                        <div class="user-details">
                            <h2>Welcome back!</h2>
                            <p>Ready to offer a ride?</p>
                        </div>
                    </div>
                    
                    <div class="header-actions">
                        <button class="icon-btn" id="notifications-btn">
                            <i data-feather="bell"></i>
                            <span class="notification-badge">2</span>
                        </button>
                        <button class="icon-btn" id="profile-btn">
                            <i data-feather="user"></i>
                        </button>
                    </div>
                </div>

                <div class="ride-status-card" id="ride-status-card" style="display: ${this.currentRide ? 'block' : 'none'}">
                    ${this.currentRide ? this.renderRideStatus() : ''}
                </div>

                <div class="quick-actions" id="quick-actions" style="display: ${this.currentRide ? 'none' : 'flex'}">
                    <button class="action-card" id="create-ride-btn">
                        <i data-feather="plus-circle"></i>
                        <span>Offer a Ride</span>
                    </button>
                    
                    <button class="action-card" id="ride-history-btn">
                        <i data-feather="clock"></i>
                        <span>Ride History</span>
                    </button>
                    
                    <button class="action-card" id="earnings-btn">
                        <i data-feather="dollar-sign"></i>
                        <span>Earnings</span>
                    </button>
                </div>

                <div class="dashboard-tabs">
                    <button class="tab-btn ${this.activeTab === 'map' ? 'active' : ''}" data-tab="map">
                        <i data-feather="map"></i>
                        <span>Map</span>
                    </button>
                    <button class="tab-btn ${this.activeTab === 'matches' ? 'active' : ''}" data-tab="matches">
                        <i data-feather="heart"></i>
                        <span>Matches</span>
                    </button>
                    <button class="tab-btn ${this.activeTab === 'requests' ? 'active' : ''}" data-tab="requests">
                        <i data-feather="users"></i>
                        <span>Requests</span>
                    </button>
                </div>

                <div class="dashboard-content">
                    <div id="map-tab" class="tab-content ${this.activeTab === 'map' ? 'active' : ''}">
                        <div id="map-container" class="map-container">
                            <div id="rider-map" class="map"></div>
                            <div class="map-controls">
                                <button class="map-control-btn" id="center-location">
                                    <i data-feather="crosshair"></i>
                                </button>
                                <button class="map-control-btn" id="toggle-traffic">
                                    <i data-feather="activity"></i>
                                </button>
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
                                    <p>Start offering rides to connect with seekers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="requests-tab" class="tab-content ${this.activeTab === 'requests' ? 'active' : ''}">
                        <div class="requests-container">
                            <h3>Ride Requests</h3>
                            <div id="requests-list" class="requests-list">
                                <div class="empty-state">
                                    <i data-feather="users"></i>
                                    <h4>No requests yet</h4>
                                    <p>Offer a ride to start receiving requests</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create Ride Modal -->
                <div id="create-ride-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal create-ride-modal">
                        <div class="modal-header">
                            <h2>Offer a Ride</h2>
                            <button class="close-modal" id="close-create-ride">
                                <i data-feather="x"></i>
                            </button>
                        </div>
                        
                        <div class="modal-content">
                            <form id="create-ride-form">
                                <div class="input-group">
                                    <label>From</label>
                                    <div class="location-input">
                                        <i data-feather="map-pin"></i>
                                        <input type="text" id="start-location" placeholder="Enter starting location" required>
                                        <button type="button" id="use-current-location">
                                            <i data-feather="crosshair"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="input-group">
                                    <label>To (Optional)</label>
                                    <div class="location-input">
                                        <i data-feather="map-pin"></i>
                                        <input type="text" id="end-location" placeholder="Enter destination">
                                    </div>
                                </div>
                                
                                <div class="input-group">
                                    <label>Departure Time</label>
                                    <input type="datetime-local" id="departure-time" required>
                                </div>
                                
                                <div class="input-group">
                                    <label>Available Seats</label>
                                    <select id="available-seats" required>
                                        <option value="1">1 seat</option>
                                        <option value="2">2 seats</option>
                                        <option value="3">3 seats</option>
                                        <option value="4">4 seats</option>
                                    </select>
                                </div>
                                
                                <div class="input-group">
                                    <label>Price per Seat ($)</label>
                                    <input type="number" id="price-per-seat" min="5" max="100" placeholder="15" required>
                                </div>
                                
                                <div class="input-group">
                                    <label>Additional Notes</label>
                                    <textarea id="ride-notes" placeholder="Any additional information for passengers..." rows="3"></textarea>
                                </div>
                                
                                <div class="modal-actions">
                                    <button type="button" class="btn btn-secondary" id="cancel-create-ride">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        Create Ride
                                        <i data-feather="arrow-right"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRideStatus() {
        if (!this.currentRide) return '';
        
        const statusInfo = {
            'available': { icon: 'clock', text: 'Waiting for passengers', color: 'orange' },
            'matched': { icon: 'users', text: 'Passengers found', color: 'blue' },
            'in_progress': { icon: 'navigation', text: 'Ride in progress', color: 'green' },
            'completed': { icon: 'check-circle', text: 'Ride completed', color: 'green' }
        };
        
        const status = statusInfo[this.currentRide.status] || statusInfo.available;
        
        return `
            <div class="ride-status-header">
                <div class="status-icon ${status.color}">
                    <i data-feather="${status.icon}"></i>
                </div>
                <div class="status-info">
                    <h3>${status.text}</h3>
                    <p>From: ${this.currentRide.startLocation}</p>
                    ${this.currentRide.endLocation ? `<p>To: ${this.currentRide.endLocation}</p>` : ''}
                </div>
            </div>
            
            <div class="ride-actions">
                ${this.currentRide.status === 'available' ? 
                    '<button class="btn btn-secondary btn-sm" id="cancel-ride">Cancel Ride</button>' : 
                    '<button class="btn btn-primary btn-sm" id="view-ride-details">View Details</button>'
                }
            </div>
        `;
    }

    async init() {
        await this.loadCurrentRide();
        this.setupTabs();
        this.setupActions();
        this.setupMap();
        this.loadMatches();
        this.loadRequests();
    }

    async loadCurrentRide() {
        try {
            const userId = this.app.currentUser.uid;
            const ridesRef = firebase.firestore().collection('rides');
            const activeRideQuery = ridesRef
                .where('riderId', '==', userId)
                .where('status', 'in', ['available', 'matched', 'in_progress'])
                .limit(1);
            
            const snapshot = await activeRideQuery.get();
            
            if (!snapshot.empty) {
                this.currentRide = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            }
        } catch (error) {
            console.error('Error loading current ride:', error);
        }
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
        }
    }

    setupActions() {
        // Header actions
        document.getElementById('notifications-btn').addEventListener('click', () => {
            this.showNotifications();
        });
        
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showProfile();
        });
        
        // Quick actions
        document.getElementById('create-ride-btn').addEventListener('click', () => {
            this.showCreateRideModal();
        });
        
        document.getElementById('ride-history-btn').addEventListener('click', () => {
            this.showRideHistory();
        });
        
        document.getElementById('earnings-btn').addEventListener('click', () => {
            this.showEarnings();
        });
        
        // Create ride modal
        this.setupCreateRideModal();
        
        // Ride status actions
        if (this.currentRide) {
            this.setupRideStatusActions();
        }
    }

    setupCreateRideModal() {
        const modal = document.getElementById('create-ride-modal');
        const form = document.getElementById('create-ride-form');
        
        document.getElementById('close-create-ride').addEventListener('click', () => {
            this.hideCreateRideModal();
        });
        
        document.getElementById('cancel-create-ride').addEventListener('click', () => {
            this.hideCreateRideModal();
        });
        
        document.getElementById('use-current-location').addEventListener('click', async () => {
            await this.useCurrentLocation();
        });
        
        // Set default departure time to 30 minutes from now
        const departureTime = document.getElementById('departure-time');
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        departureTime.value = now.toISOString().slice(0, 16);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createRide();
        });
    }

    showCreateRideModal() {
        document.getElementById('create-ride-modal').style.display = 'flex';
    }

    hideCreateRideModal() {
        document.getElementById('create-ride-modal').style.display = 'none';
    }

    async useCurrentLocation() {
        try {
            const location = await LocationService.getCurrentLocation();
            const address = await LocationService.reverseGeocode(location.lat, location.lng);
            document.getElementById('start-location').value = address;
        } catch (error) {
            console.error('Error getting current location:', error);
            this.app.showError('Failed to get current location');
        }
    }

    async createRide() {
        try {
            const formData = new FormData(document.getElementById('create-ride-form'));
            const rideData = {
                riderId: this.app.currentUser.uid,
                startLocation: document.getElementById('start-location').value,
                endLocation: document.getElementById('end-location').value || null,
                departureTime: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('departure-time').value)),
                availableSeats: parseInt(document.getElementById('available-seats').value),
                pricePerSeat: parseFloat(document.getElementById('price-per-seat').value),
                notes: document.getElementById('ride-notes').value || null,
                status: 'available',
                createdAt: firebase.firestore.Timestamp.now(),
                matches: [],
                requests: []
            };
            
            // Get coordinates for start location
            const startCoords = await LocationService.geocode(rideData.startLocation);
            rideData.startCoordinates = new firebase.firestore.GeoPoint(startCoords.lat, startCoords.lng);
            
            // Get coordinates for end location if provided
            if (rideData.endLocation) {
                const endCoords = await LocationService.geocode(rideData.endLocation);
                rideData.endCoordinates = new firebase.firestore.GeoPoint(endCoords.lat, endCoords.lng);
            }
            
            // Save ride to Firestore
            const rideRef = await firebase.firestore().collection('rides').add(rideData);
            
            this.currentRide = { id: rideRef.id, ...rideData };
            this.hideCreateRideModal();
            this.app.showSuccess('Ride created successfully!');
            
            // Update UI
            this.updateRideStatusDisplay();
            
        } catch (error) {
            console.error('Error creating ride:', error);
            this.app.showError('Failed to create ride. Please try again.');
        }
    }

    updateRideStatusDisplay() {
        const statusCard = document.getElementById('ride-status-card');
        const quickActions = document.getElementById('quick-actions');
        
        if (this.currentRide) {
            statusCard.innerHTML = this.renderRideStatus();
            statusCard.style.display = 'block';
            quickActions.style.display = 'none';
            this.setupRideStatusActions();
        } else {
            statusCard.style.display = 'none';
            quickActions.style.display = 'flex';
        }
        
        feather.replace();
    }

    setupRideStatusActions() {
        const cancelBtn = document.getElementById('cancel-ride');
        const viewDetailsBtn = document.getElementById('view-ride-details');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelCurrentRide();
            });
        }
        
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                this.app.showRideStatus(this.currentRide.id);
            });
        }
    }

    async cancelCurrentRide() {
        if (!this.currentRide) return;
        
        try {
            await firebase.firestore().collection('rides').doc(this.currentRide.id).update({
                status: 'cancelled',
                cancelledAt: firebase.firestore.Timestamp.now()
            });
            
            this.currentRide = null;
            this.updateRideStatusDisplay();
            this.app.showSuccess('Ride cancelled successfully');
            
        } catch (error) {
            console.error('Error cancelling ride:', error);
            this.app.showError('Failed to cancel ride');
        }
    }

    setupMap() {
        if (this.activeTab === 'map') {
            setTimeout(() => this.initMap(), 100);
        }
    }

    async initMap() {
        try {
            const mapContainer = document.getElementById('rider-map');
            if (!mapContainer || this.map) return;
            
            // Get user location
            const location = await LocationService.getCurrentLocation();
            this.userLocation = location;
            
            // Initialize Mapbox map
            mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';
            
            this.map = new mapboxgl.Map({
                container: 'rider-map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [location.lng, location.lat],
                zoom: 14
            });
            
            // Add user location marker
            new mapboxgl.Marker({ color: '#4F46E5' })
                .setLngLat([location.lng, location.lat])
                .addTo(this.map);
            
            // Add current ride marker if exists
            if (this.currentRide && this.currentRide.startCoordinates) {
                this.addRideMarker();
            }
            
            this.setupMapControls();
            
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('rider-map').innerHTML = `
                <div class="map-error">
                    <i data-feather="map-pin"></i>
                    <p>Unable to load map. Please check your connection.</p>
                </div>
            `;
            feather.replace();
        }
    }

    addRideMarker() {
        if (!this.map || !this.currentRide.startCoordinates) return;
        
        const coords = this.currentRide.startCoordinates;
        
        // Remove existing ride marker
        if (this.rideMarker) {
            this.rideMarker.remove();
        }
        
        // Add new ride marker
        this.rideMarker = new mapboxgl.Marker({ color: '#10B981' })
            .setLngLat([coords.longitude, coords.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <div class="ride-popup">
                    <h4>Your Ride</h4>
                    <p>${this.currentRide.startLocation}</p>
                    <small>Status: ${this.currentRide.status}</small>
                </div>
            `))
            .addTo(this.map);
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
        
        document.getElementById('toggle-traffic').addEventListener('click', (e) => {
            if (!this.map) return;
            
            const btn = e.currentTarget;
            const trafficLayer = this.map.getLayer('traffic');
            
            if (trafficLayer) {
                this.map.removeLayer('traffic');
                this.map.removeSource('traffic');
                btn.classList.remove('active');
            } else {
                this.map.addSource('traffic', {
                    type: 'vector',
                    url: 'mapbox://mapbox.mapbox-traffic-v1'
                });
                
                this.map.addLayer({
                    id: 'traffic',
                    source: 'traffic',
                    'source-layer': 'traffic',
                    type: 'line',
                    paint: {
                        'line-width': 2,
                        'line-color': [
                            'case',
                            ['==', ['get', 'congestion'], 'low'], '#4CAF50',
                            ['==', ['get', 'congestion'], 'moderate'], '#FF9800',
                            ['==', ['get', 'congestion'], 'heavy'], '#F44336',
                            '#9E9E9E'
                        ]
                    }
                });
                
                btn.classList.add('active');
            }
        });
    }

    async loadMatches() {
        try {
            const userId = this.app.currentUser.uid;
            const matchesRef = firebase.firestore().collection('matches');
            const matchesQuery = matchesRef.where('riderId', '==', userId);
            
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
                    <p>Start offering rides to connect with seekers</p>
                </div>
            `;
        } else {
            container.innerHTML = matches.map(match => `
                <div class="match-card" data-match-id="${match.id}">
                    <div class="match-avatar">
                        <img src="${match.seekerPhoto || '/api/placeholder/60/60'}" alt="Seeker">
                    </div>
                    <div class="match-info">
                        <h4>${match.seekerName}</h4>
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

    async loadRequests() {
        // This would load ride requests from seekers
        // For now, showing empty state
        const container = document.getElementById('requests-list');
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="users"></i>
                <h4>No requests yet</h4>
                <p>Offer a ride to start receiving requests</p>
            </div>
        `;
        feather.replace();
    }

    showNotifications() {
        // TODO: Implement notifications
        this.app.showToast('Notifications feature coming soon!');
    }

    showProfile() {
        // TODO: Implement profile view
        this.app.showToast('Profile feature coming soon!');
    }

    showRideHistory() {
        // TODO: Implement ride history
        this.app.showToast('Ride history feature coming soon!');
    }

    showEarnings() {
        // TODO: Implement earnings view
        this.app.showToast('Earnings feature coming soon!');
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}
