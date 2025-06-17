class AuthScreen {
    constructor(app) {
        this.app = app;
        this.isVerifying = false;
        this.phoneNumber = '';
        this.verificationId = null;
        this.appVerifier = null;
    }

    render() {
        return `
            <div class="auth-screen">
                <div class="auth-header">
                    <div class="app-logo">
                        <i data-feather="heart" class="logo-icon"></i>
                        <h1>Rider-Seeker</h1>
                        <p>Connect hearts and journeys</p>
                    </div>
                </div>

                <div class="auth-content">
                    <div id="phone-step" class="auth-step active">
                        <h2>Enter Your Phone Number</h2>
                        <p>We'll send you a verification code to confirm your number</p>
                        
                        <form id="phone-form" class="auth-form">
                            <div class="input-group">
                                <div class="country-code">
                                    <select id="country-code">
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+86">🇨🇳 +86</option>
                                        <option value="+81">🇯🇵 +81</option>
                                        <option value="+49">🇩🇪 +49</option>
                                        <option value="+33">🇫🇷 +33</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+55">🇧🇷 +55</option>
                                        <option value="+7">🇷🇺 +7</option>
                                    </select>
                                </div>
                                <input 
                                    type="tel" 
                                    id="phone-input" 
                                    placeholder="Phone number"
                                    maxlength="15"
                                    required
                                >
                            </div>
                            <div id="recaptcha-container"></div>
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-text">Send Code</span>
                                <div class="btn-spinner" style="display: none;">
                                    <i data-feather="loader" class="spinner"></i>
                                </div>
                            </button>
                        </form>
                    </div>

                    <div id="verification-step" class="auth-step">
                        <h2>Enter Verification Code</h2>
                        <p>We sent a 6-digit code to <span id="sent-phone"></span></p>
                        
                        <form id="verification-form" class="auth-form">
                            <div class="verification-inputs">
                                <input type="text" maxlength="1" class="verification-digit" data-index="0">
                                <input type="text" maxlength="1" class="verification-digit" data-index="1">
                                <input type="text" maxlength="1" class="verification-digit" data-index="2">
                                <input type="text" maxlength="1" class="verification-digit" data-index="3">
                                <input type="text" maxlength="1" class="verification-digit" data-index="4">
                                <input type="text" maxlength="1" class="verification-digit" data-index="5">
                            </div>
                            
                            <button type="submit" class="btn btn-primary" id="verify-btn">
                                <span class="btn-text">Verify</span>
                                <div class="btn-spinner" style="display: none;">
                                    <i data-feather="loader" class="spinner"></i>
                                </div>
                            </button>
                            
                            <button type="button" class="btn btn-text" id="resend-btn">
                                Resend Code
                            </button>
                            
                            <button type="button" class="btn btn-text" id="change-phone-btn">
                                Change Phone Number
                            </button>
                        </form>
                    </div>
                </div>

                <div class="auth-footer">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        `;
    }

    init() {
        this.setupPhoneForm();
        this.setupVerificationForm();
        this.setupRecaptcha();
    }

    setupRecaptcha() {
        // Initialize reCAPTCHA
        this.appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            }
        });
    }

    setupPhoneForm() {
        const form = document.getElementById('phone-form');
        const phoneInput = document.getElementById('phone-input');
        
        // Format phone input
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            e.target.value = value;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendVerificationCode();
        });
    }

    setupVerificationForm() {
        const form = document.getElementById('verification-form');
        const inputs = document.querySelectorAll('.verification-digit');
        
        // Handle input navigation
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.verifyCode();
        });

        document.getElementById('resend-btn').addEventListener('click', () => {
            this.resendCode();
        });

        document.getElementById('change-phone-btn').addEventListener('click', () => {
            this.showPhoneStep();
        });
    }

    async sendVerificationCode() {
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone-input').value;
        
        if (!phoneNumber || phoneNumber.length < 10) {
            this.app.showError('Please enter a valid phone number');
            return;
        }

        this.phoneNumber = countryCode + phoneNumber;
        
        try {
            this.setLoading('phone-form', true);
            
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(
                this.phoneNumber, 
                this.appVerifier
            );
            
            this.verificationId = confirmationResult.verificationId;
            document.getElementById('sent-phone').textContent = this.phoneNumber;
            this.showVerificationStep();
            
        } catch (error) {
            console.error('SMS send error:', error);
            this.app.showError('Failed to send verification code. Please try again.');
        } finally {
            this.setLoading('phone-form', false);
        }
    }

    async verifyCode() {
        const inputs = document.querySelectorAll('.verification-digit');
        const code = Array.from(inputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            this.app.showError('Please enter the complete 6-digit code');
            return;
        }

        try {
            this.setLoading('verification-form', true);
            
            const credential = firebase.auth.PhoneAuthProvider.credential(
                this.verificationId, 
                code
            );
            
            await firebase.auth().signInWithCredential(credential);
            this.app.showSuccess('Phone number verified successfully!');
            
        } catch (error) {
            console.error('Verification error:', error);
            this.app.showError('Invalid verification code. Please try again.');
            // Clear inputs
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        } finally {
            this.setLoading('verification-form', false);
        }
    }

    async resendCode() {
        try {
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(
                this.phoneNumber, 
                this.appVerifier
            );
            
            this.verificationId = confirmationResult.verificationId;
            this.app.showSuccess('Verification code sent again');
            
        } catch (error) {
            console.error('Resend error:', error);
            this.app.showError('Failed to resend code. Please try again.');
        }
    }

    showPhoneStep() {
        document.getElementById('phone-step').classList.add('active');
        document.getElementById('verification-step').classList.remove('active');
    }

    showVerificationStep() {
        document.getElementById('phone-step').classList.remove('active');
        document.getElementById('verification-step').classList.add('active');
        
        // Focus first input
        setTimeout(() => {
            document.querySelector('.verification-digit').focus();
        }, 300);
    }

    setLoading(formId, loading) {
        const form = document.getElementById(formId);
        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        if (loading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'flex';
        } else {
            btn.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    destroy() {
        if (this.appVerifier) {
            this.appVerifier.clear();
        }
    }
}
