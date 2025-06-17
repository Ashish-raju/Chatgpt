class PaymentScreen {
    constructor(app, rideData) {
        this.app = app;
        this.ride = rideData;
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.paymentIntent = null;
        this.isProcessing = false;
    }

    render() {
        const totalAmount = this.ride.pricePerSeat;
        const platformFee = Math.max(1, totalAmount * 0.05); // 5% or $1 minimum
        const finalTotal = totalAmount + platformFee;

        return `
            <div class="payment-screen">
                <div class="payment-header">
                    <button class="back-btn" id="back-btn">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <h1>Payment</h1>
                </div>

                <div class="payment-content">
                    <div class="ride-summary">
                        <h2>Ride Summary</h2>
                        
                        <div class="ride-info-card">
                            <div class="ride-route">
                                <div class="route-point">
                                    <i data-feather="circle" class="route-icon start"></i>
                                    <span>${this.ride.startLocation}</span>
                                </div>
                                <div class="route-line"></div>
                                ${this.ride.endLocation ? `
                                    <div class="route-point">
                                        <i data-feather="map-pin" class="route-icon end"></i>
                                        <span>${this.ride.endLocation}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="ride-details">
                                <div class="detail">
                                    <span class="label">Departure:</span>
                                    <span class="value">${this.formatDateTime(this.ride.departureTime)}</span>
                                </div>
                                <div class="detail">
                                    <span class="label">Passengers:</span>
                                    <span class="value">1 seat</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-breakdown">
                        <h2>Payment Breakdown</h2>
                        
                        <div class="breakdown-card">
                            <div class="breakdown-item">
                                <span>Ride fare</span>
                                <span>$${totalAmount.toFixed(2)}</span>
                            </div>
                            <div class="breakdown-item">
                                <span>Platform fee</span>
                                <span>$${platformFee.toFixed(2)}</span>
                            </div>
                            <div class="breakdown-divider"></div>
                            <div class="breakdown-item total">
                                <span>Total</span>
                                <span>$${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="payment-note">
                            <i data-feather="info"></i>
                            <p>Note: If both you and the rider rate this as "It's a date," this payment will be refunded!</p>
                        </div>
                    </div>

                    <div class="payment-methods">
                        <h2>Payment Method</h2>
                        
                        <div class="payment-options">
                            <div class="payment-option active" data-method="card">
                                <div class="option-header">
                                    <i data-feather="credit-card"></i>
                                    <span>Credit/Debit Card</span>
                                </div>
                                <div class="option-indicator">
                                    <i data-feather="check"></i>
                                </div>
                            </div>
                            
                            <div class="payment-option" data-method="paypal">
                                <div class="option-header">
                                    <i data-feather="dollar-sign"></i>
                                    <span>PayPal</span>
                                </div>
                                <div class="option-indicator">
                                    <i data-feather="check"></i>
                                </div>
                            </div>
                            
                            <div class="payment-option" data-method="apple">
                                <div class="option-header">
                                    <i data-feather="smartphone"></i>
                                    <span>Apple Pay</span>
                                </div>
                                <div class="option-indicator">
                                    <i data-feather="check"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card-payment-form" id="card-payment-form">
                        <h3>Card Details</h3>
                        
                        <div class="form-group">
                            <label for="cardholder-name">Cardholder Name</label>
                            <input type="text" id="cardholder-name" placeholder="John Doe" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Card Information</label>
                            <div id="card-element" class="card-element">
                                <!-- Stripe Elements will create form elements here -->
                            </div>
                            <div id="card-errors" class="card-errors"></div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="billing-zip">ZIP Code</label>
                                <input type="text" id="billing-zip" placeholder="12345" required>
                            </div>
                            <div class="form-group">
                                <label for="billing-country">Country</label>
                                <select id="billing-country" required>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="security-info">
                            <i data-feather="shield"></i>
                            <span>Your payment information is encrypted and secure</span>
                        </div>
                    </div>

                    <div class="saved-cards" id="saved-cards" style="display: none;">
                        <h3>Saved Cards</h3>
                        <div class="saved-cards-list">
                            <!-- Saved cards will be loaded here -->
                        </div>
                        <button class="btn btn-text" id="add-new-card">
                            <i data-feather="plus"></i>
                            Add New Card
                        </button>
                    </div>

                    <div class="payment-actions">
                        <div class="payment-total">
                            <span>Total: $${finalTotal.toFixed(2)}</span>
                        </div>
                        
                        <button class="btn btn-primary btn-lg" id="pay-button">
                            <span class="btn-text">Pay Now</span>
                            <div class="btn-spinner" style="display: none;">
                                <i data-feather="loader" class="spinner"></i>
                            </div>
                        </button>
                        
                        <div class="payment-security">
                            <div class="security-badges">
                                <span class="badge">
                                    <i data-feather="shield"></i>
                                    SSL Secured
                                </span>
                                <span class="badge">
                                    <i data-feather="lock"></i>
                                    256-bit Encryption
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Success Modal -->
                <div id="payment-success-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal payment-success-modal">
                        <div class="success-animation">
                            <div class="success-icon">
                                <i data-feather="check-circle"></i>
                            </div>
                            <h2>Payment Successful!</h2>
                            <p>Your ride is confirmed. Have a great trip!</p>
                            
                            <div class="receipt-summary">
                                <div class="receipt-item">
                                    <span>Amount Paid:</span>
                                    <span>$${finalTotal.toFixed(2)}</span>
                                </div>
                                <div class="receipt-item">
                                    <span>Transaction ID:</span>
                                    <span id="transaction-id">-</span>
                                </div>
                            </div>
                            
                            <div class="success-actions">
                                <button class="btn btn-secondary" id="view-full-receipt">
                                    View Receipt
                                </button>
                                <button class="btn btn-primary" id="continue-to-ride">
                                    Continue to Ride
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Error Modal -->
                <div id="payment-error-modal" class="modal-backdrop" style="display: none;">
                    <div class="modal payment-error-modal">
                        <div class="error-animation">
                            <div class="error-icon">
                                <i data-feather="x-circle"></i>
                            </div>
                            <h2>Payment Failed</h2>
                            <p id="payment-error-message">Your payment could not be processed. Please try again.</p>
                            
                            <div class="error-actions">
                                <button class="btn btn-secondary" id="change-payment-method">
                                    Change Payment Method
                                </button>
                                <button class="btn btn-primary" id="retry-payment">
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatDateTime(timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async init() {
        await this.initializeStripe();
        this.setupPaymentOptions();
        this.setupPaymentForm();
        this.loadSavedCards();
    }

    async initializeStripe() {
        try {
            // Initialize Stripe
            this.stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_example');
            
            // Create Elements instance
            this.elements = this.stripe.elements({
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#4F46E5',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px'
                    }
                }
            });
            
            // Create card element
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#1f2937',
                        '::placeholder': {
                            color: '#9ca3af'
                        }
                    }
                }
            });
            
            // Mount card element
            this.cardElement.mount('#card-element');
            
            // Handle real-time validation errors from the card Element
            this.cardElement.on('change', ({error}) => {
                const displayError = document.getElementById('card-errors');
                if (error) {
                    displayError.textContent = error.message;
                    displayError.style.display = 'block';
                } else {
                    displayError.textContent = '';
                    displayError.style.display = 'none';
                }
            });
            
        } catch (error) {
            console.error('Error initializing Stripe:', error);
            this.app.showError('Failed to initialize payment system');
        }
    }

    setupPaymentOptions() {
        const paymentOptions = document.querySelectorAll('.payment-option');
        
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
                
                const method = option.dataset.method;
                this.switchPaymentMethod(method);
            });
        });
    }

    switchPaymentMethod(method) {
        const cardForm = document.getElementById('card-payment-form');
        const savedCards = document.getElementById('saved-cards');
        
        // Hide all payment forms
        cardForm.style.display = 'none';
        savedCards.style.display = 'none';
        
        switch (method) {
            case 'card':
                cardForm.style.display = 'block';
                break;
            case 'paypal':
                this.app.showToast('PayPal integration coming soon!');
                break;
            case 'apple':
                this.app.showToast('Apple Pay integration coming soon!');
                break;
        }
    }

    setupPaymentForm() {
        document.getElementById('back-btn').addEventListener('click', () => {
            this.app.goBack();
        });
        
        document.getElementById('pay-button').addEventListener('click', () => {
            this.processPayment();
        });
        
        document.getElementById('add-new-card')?.addEventListener('click', () => {
            this.switchPaymentMethod('card');
        });
        
        this.setupSuccessModal();
        this.setupErrorModal();
    }

    setupSuccessModal() {
        document.getElementById('view-full-receipt')?.addEventListener('click', () => {
            this.viewFullReceipt();
        });
        
        document.getElementById('continue-to-ride')?.addEventListener('click', () => {
            this.continueToRide();
        });
    }

    setupErrorModal() {
        document.getElementById('change-payment-method')?.addEventListener('click', () => {
            this.hideErrorModal();
        });
        
        document.getElementById('retry-payment')?.addEventListener('click', () => {
            this.hideErrorModal();
            this.processPayment();
        });
    }

    async loadSavedCards() {
        try {
            // In a real app, load saved payment methods from backend
            // For now, we'll skip this feature
            const savedCards = document.getElementById('saved-cards');
            savedCards.style.display = 'none';
        } catch (error) {
            console.error('Error loading saved cards:', error);
        }
    }

    async processPayment() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.setPaymentLoading(true);
        
        try {
            // Validate form
            const cardholderName = document.getElementById('cardholder-name').value.trim();
            const billingZip = document.getElementById('billing-zip').value.trim();
            
            if (!cardholderName) {
                throw new Error('Please enter cardholder name');
            }
            
            if (!billingZip) {
                throw new Error('Please enter billing ZIP code');
            }
            
            // Create payment method
            const {error: paymentMethodError, paymentMethod} = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
                billing_details: {
                    name: cardholderName,
                    address: {
                        postal_code: billingZip,
                        country: document.getElementById('billing-country').value
                    }
                }
            });
            
            if (paymentMethodError) {
                throw new Error(paymentMethodError.message);
            }
            
            // Create payment intent on backend
            const paymentIntentData = await this.createPaymentIntent(paymentMethod.id);
            
            // Confirm payment
            const {error: confirmError, paymentIntent} = await this.stripe.confirmCardPayment(
                paymentIntentData.client_secret,
                {
                    payment_method: paymentMethod.id
                }
            );
            
            if (confirmError) {
                throw new Error(confirmError.message);
            }
            
            if (paymentIntent.status === 'succeeded') {
                await this.handlePaymentSuccess(paymentIntent);
            } else {
                throw new Error('Payment was not completed');
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            this.handlePaymentError(error.message);
        } finally {
            this.isProcessing = false;
            this.setPaymentLoading(false);
        }
    }

    async createPaymentIntent(paymentMethodId) {
        try {
            // In a real app, this would call your backend API
            // For demo purposes, we'll simulate the response
            const totalAmount = this.ride.pricePerSeat + Math.max(1, this.ride.pricePerSeat * 0.05);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                id: 'pi_' + Math.random().toString(36).substr(2, 9),
                client_secret: 'pi_' + Math.random().toString(36).substr(2, 9) + '_secret_' + Math.random().toString(36).substr(2, 9),
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: 'usd'
            };
            
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw new Error('Failed to process payment');
        }
    }

    async handlePaymentSuccess(paymentIntent) {
        try {
            // Save payment record to Firestore
            const paymentData = {
                rideId: this.ride.id,
                payerId: this.app.currentUser.uid,
                payeeId: this.ride.riderId,
                amount: this.ride.pricePerSeat,
                platformFee: Math.max(1, this.ride.pricePerSeat * 0.05),
                totalAmount: this.ride.pricePerSeat + Math.max(1, this.ride.pricePerSeat * 0.05),
                paymentIntentId: paymentIntent.id,
                status: 'completed',
                createdAt: firebase.firestore.Timestamp.now()
            };
            
            await firebase.firestore().collection('payments').add(paymentData);
            
            // Update ride status
            await firebase.firestore().collection('rides').doc(this.ride.id).update({
                paymentStatus: 'paid',
                paymentId: paymentIntent.id
            });
            
            this.showSuccessModal(paymentIntent.id);
            
        } catch (error) {
            console.error('Error handling payment success:', error);
            this.app.showError('Payment processed but failed to update records');
        }
    }

    handlePaymentError(errorMessage) {
        this.showErrorModal(errorMessage);
    }

    showSuccessModal(transactionId) {
        document.getElementById('transaction-id').textContent = transactionId;
        document.getElementById('payment-success-modal').style.display = 'flex';
        feather.replace();
    }

    showErrorModal(errorMessage) {
        document.getElementById('payment-error-message').textContent = errorMessage;
        document.getElementById('payment-error-modal').style.display = 'flex';
        feather.replace();
    }

    hideErrorModal() {
        document.getElementById('payment-error-modal').style.display = 'none';
    }

    viewFullReceipt() {
        this.app.showToast('Receipt feature coming soon!');
    }

    continueToRide() {
        document.getElementById('payment-success-modal').style.display = 'none';
        this.app.showRideStatus(this.ride.id);
    }

    setPaymentLoading(loading) {
        const button = document.getElementById('pay-button');
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');
        
        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'flex';
        } else {
            button.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    destroy() {
        if (this.cardElement) {
            this.cardElement.destroy();
        }
    }
}
