class KYCVerification {
    constructor(app) {
        this.app = app;
        this.uploadedDocuments = {};
        this.verificationStatus = 'pending';
    }

    render() {
        return `
            <div class="kyc-verification">
                <div class="kyc-header">
                    <button class="back-btn" id="back-btn">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <h1>Identity Verification</h1>
                    <p>Verify your identity to start offering rides</p>
                </div>

                <div class="kyc-content">
                    <div class="kyc-info">
                        <div class="info-card">
                            <i data-feather="shield-check" class="info-icon"></i>
                            <h3>Why verify your identity?</h3>
                            <ul>
                                <li>Build trust with passengers</li>
                                <li>Access all rider features</li>
                                <li>Comply with safety regulations</li>
                                <li>Protect the community</li>
                            </ul>
                        </div>
                    </div>

                    <div class="document-upload-section">
                        <h2>Required Documents</h2>
                        
                        <div class="document-item">
                            <div class="document-header">
                                <div class="document-info">
                                    <i data-feather="credit-card" class="document-icon"></i>
                                    <div>
                                        <h3>Driver's License</h3>
                                        <p>Front and back of your valid driver's license</p>
                                    </div>
                                </div>
                                <div class="upload-status" id="license-status">
                                    ${this.uploadedDocuments.license ? 
                                        '<i data-feather="check-circle" class="status-icon success"></i>' :
                                        '<i data-feather="upload" class="status-icon"></i>'
                                    }
                                </div>
                            </div>
                            
                            <div class="document-upload" data-document="license">
                                ${this.uploadedDocuments.license ? 
                                    `<div class="uploaded-docs">
                                        ${this.uploadedDocuments.license.front ? 
                                            `<div class="uploaded-doc">
                                                <img src="${this.uploadedDocuments.license.front}" alt="License front">
                                                <div class="doc-label">Front</div>
                                                <button class="remove-doc" data-document="license" data-side="front">
                                                    <i data-feather="x"></i>
                                                </button>
                                            </div>` : ''
                                        }
                                        ${this.uploadedDocuments.license.back ? 
                                            `<div class="uploaded-doc">
                                                <img src="${this.uploadedDocuments.license.back}" alt="License back">
                                                <div class="doc-label">Back</div>
                                                <button class="remove-doc" data-document="license" data-side="back">
                                                    <i data-feather="x"></i>
                                                </button>
                                            </div>` : ''
                                        }
                                    </div>` :
                                    `<div class="upload-placeholder" data-document="license">
                                        <i data-feather="camera"></i>
                                        <p>Tap to upload license photos</p>
                                        <small>JPG, PNG up to 5MB each</small>
                                    </div>`
                                }
                            </div>
                        </div>

                        <div class="document-item">
                            <div class="document-header">
                                <div class="document-info">
                                    <i data-feather="user" class="document-icon"></i>
                                    <div>
                                        <h3>Government ID</h3>
                                        <p>Passport, national ID, or state ID</p>
                                    </div>
                                </div>
                                <div class="upload-status" id="id-status">
                                    ${this.uploadedDocuments.id ? 
                                        '<i data-feather="check-circle" class="status-icon success"></i>' :
                                        '<i data-feather="upload" class="status-icon"></i>'
                                    }
                                </div>
                            </div>
                            
                            <div class="document-upload" data-document="id">
                                ${this.uploadedDocuments.id ? 
                                    `<div class="uploaded-docs">
                                        <div class="uploaded-doc">
                                            <img src="${this.uploadedDocuments.id}" alt="Government ID">
                                            <div class="doc-label">ID Document</div>
                                            <button class="remove-doc" data-document="id">
                                                <i data-feather="x"></i>
                                            </button>
                                        </div>
                                    </div>` :
                                    `<div class="upload-placeholder" data-document="id">
                                        <i data-feather="camera"></i>
                                        <p>Tap to upload ID photo</p>
                                        <small>JPG, PNG up to 5MB</small>
                                    </div>`
                                }
                            </div>
                        </div>

                        <div class="document-item">
                            <div class="document-header">
                                <div class="document-info">
                                    <i data-feather="camera" class="document-icon"></i>
                                    <div>
                                        <h3>Selfie Verification</h3>
                                        <p>Take a clear selfie for identity matching</p>
                                    </div>
                                </div>
                                <div class="upload-status" id="selfie-status">
                                    ${this.uploadedDocuments.selfie ? 
                                        '<i data-feather="check-circle" class="status-icon success"></i>' :
                                        '<i data-feather="upload" class="status-icon"></i>'
                                    }
                                </div>
                            </div>
                            
                            <div class="document-upload" data-document="selfie">
                                ${this.uploadedDocuments.selfie ? 
                                    `<div class="uploaded-docs">
                                        <div class="uploaded-doc">
                                            <img src="${this.uploadedDocuments.selfie}" alt="Selfie">
                                            <div class="doc-label">Selfie</div>
                                            <button class="remove-doc" data-document="selfie">
                                                <i data-feather="x"></i>
                                            </button>
                                        </div>
                                    </div>` :
                                    `<div class="upload-placeholder" data-document="selfie">
                                        <i data-feather="camera"></i>
                                        <p>Tap to take selfie</p>
                                        <small>Clear photo of your face</small>
                                    </div>`
                                }
                            </div>
                        </div>
                    </div>

                    <div class="kyc-guidelines">
                        <h3>Photo Guidelines</h3>
                        <ul>
                            <li><i data-feather="check"></i> Ensure documents are clearly visible</li>
                            <li><i data-feather="check"></i> No glare or shadows on documents</li>
                            <li><i data-feather="check"></i> All text should be readable</li>
                            <li><i data-feather="check"></i> Take photos in good lighting</li>
                            <li><i data-feather="check"></i> Documents should be current and valid</li>
                        </ul>
                    </div>
                </div>

                <div class="kyc-footer">
                    <button class="btn btn-secondary" id="skip-btn">
                        Skip for Now
                    </button>
                    
                    <button class="btn btn-primary" id="submit-btn" disabled>
                        Submit for Verification
                        <i data-feather="arrow-right"></i>
                    </button>
                </div>

                <input type="file" id="document-input" accept="image/*" style="display: none;">
                <input type="file" id="camera-input" accept="image/*" capture="environment" style="display: none;">
            </div>
        `;
    }

    init() {
        this.setupDocumentUpload();
        this.setupButtons();
        this.checkSubmitButtonState();
    }

    setupDocumentUpload() {
        const documentInput = document.getElementById('document-input');
        const cameraInput = document.getElementById('camera-input');
        let currentDocumentType = null;
        let currentSide = null;

        // Handle upload placeholder clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.upload-placeholder')) {
                const documentType = e.target.closest('.upload-placeholder').dataset.document;
                currentDocumentType = documentType;
                
                if (documentType === 'license') {
                    this.showLicenseSideSelection();
                } else if (documentType === 'selfie') {
                    cameraInput.click();
                } else {
                    documentInput.click();
                }
            }
        });

        // Handle remove document buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-doc')) {
                const button = e.target.closest('.remove-doc');
                const documentType = button.dataset.document;
                const side = button.dataset.side;
                this.removeDocument(documentType, side);
            }
        });

        // Handle file input changes
        documentInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0], currentDocumentType, currentSide);
            }
        });

        cameraInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0], 'selfie');
            }
        });
    }

    showLicenseSideSelection() {
        const modal = `
            <div class="license-side-modal">
                <h3>Select License Side</h3>
                <p>Which side of your license do you want to upload?</p>
                
                <div class="side-options">
                    <button class="side-option" data-side="front">
                        <i data-feather="credit-card"></i>
                        <span>Front Side</span>
                    </button>
                    <button class="side-option" data-side="back">
                        <i data-feather="credit-card"></i>
                        <span>Back Side</span>
                    </button>
                </div>
                
                <button class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
            </div>
        `;
        
        this.app.showModal(modal);
        
        // Handle side selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.side-option')) {
                const side = e.target.closest('.side-option').dataset.side;
                currentSide = side;
                this.app.hideModal();
                document.getElementById('document-input').click();
            }
        }, { once: true });
    }

    async handleFileUpload(file, documentType, side = null) {
        if (file.size > 5 * 1024 * 1024) {
            this.app.showError('File size should be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.app.showError('Please upload an image file');
            return;
        }

        try {
            const dataUrl = await this.fileToDataUrl(file);
            
            if (documentType === 'license') {
                if (!this.uploadedDocuments.license) {
                    this.uploadedDocuments.license = {};
                }
                this.uploadedDocuments.license[side] = dataUrl;
            } else {
                this.uploadedDocuments[documentType] = dataUrl;
            }
            
            this.updateUploadDisplay();
            this.checkSubmitButtonState();
            
        } catch (error) {
            console.error('Error processing file:', error);
            this.app.showError('Failed to process file');
        }
    }

    removeDocument(documentType, side = null) {
        if (documentType === 'license' && side) {
            if (this.uploadedDocuments.license) {
                delete this.uploadedDocuments.license[side];
                if (Object.keys(this.uploadedDocuments.license).length === 0) {
                    delete this.uploadedDocuments.license;
                }
            }
        } else {
            delete this.uploadedDocuments[documentType];
        }
        
        this.updateUploadDisplay();
        this.checkSubmitButtonState();
    }

    updateUploadDisplay() {
        // Re-render the component to update the display
        const container = document.getElementById('main-container');
        container.innerHTML = this.render();
        this.init();
    }

    checkSubmitButtonState() {
        const hasLicense = this.uploadedDocuments.license && 
                          this.uploadedDocuments.license.front && 
                          this.uploadedDocuments.license.back;
        const hasId = this.uploadedDocuments.id;
        const hasSelfie = this.uploadedDocuments.selfie;
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = !(hasLicense && hasId && hasSelfie);
    }

    setupButtons() {
        document.getElementById('back-btn').addEventListener('click', () => {
            this.app.goBack();
        });

        document.getElementById('skip-btn').addEventListener('click', () => {
            this.app.showDashboard();
        });

        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitVerification();
        });
    }

    async submitVerification() {
        try {
            this.setSubmitLoading(true);
            
            // Upload documents to Firebase Storage
            const documentUrls = await this.uploadDocumentsToStorage();
            
            // Save verification data
            await this.saveVerificationData(documentUrls);
            
            this.app.showSuccess('Documents submitted for verification! You will be notified once approved.');
            this.app.showDashboard();
            
        } catch (error) {
            console.error('Error submitting verification:', error);
            this.app.showError('Failed to submit documents. Please try again.');
        } finally {
            this.setSubmitLoading(false);
        }
    }

    async uploadDocumentsToStorage() {
        const userId = this.app.currentUser.uid;
        const documentUrls = {};
        
        // Upload license documents
        if (this.uploadedDocuments.license) {
            documentUrls.license = {};
            for (const [side, dataUrl] of Object.entries(this.uploadedDocuments.license)) {
                const blob = await this.dataUrlToBlob(dataUrl);
                const docRef = firebase.storage().ref(`users/${userId}/kyc/license_${side}.jpg`);
                const snapshot = await docRef.put(blob);
                documentUrls.license[side] = await snapshot.ref.getDownloadURL();
            }
        }
        
        // Upload ID document
        if (this.uploadedDocuments.id) {
            const blob = await this.dataUrlToBlob(this.uploadedDocuments.id);
            const docRef = firebase.storage().ref(`users/${userId}/kyc/id.jpg`);
            const snapshot = await docRef.put(blob);
            documentUrls.id = await snapshot.ref.getDownloadURL();
        }
        
        // Upload selfie
        if (this.uploadedDocuments.selfie) {
            const blob = await this.dataUrlToBlob(this.uploadedDocuments.selfie);
            const docRef = firebase.storage().ref(`users/${userId}/kyc/selfie.jpg`);
            const snapshot = await docRef.put(blob);
            documentUrls.selfie = await snapshot.ref.getDownloadURL();
        }
        
        return documentUrls;
    }

    async saveVerificationData(documentUrls) {
        const userId = this.app.currentUser.uid;
        
        await FirebaseService.updateUserProfile(userId, {
            kyc: {
                documents: documentUrls,
                status: 'pending',
                submittedAt: firebase.firestore.Timestamp.now()
            },
            isVerified: false
        });
    }

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return response.blob();
    }

    setSubmitLoading(loading) {
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('i[data-feather="arrow-right"]').parentElement;
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                Submitting...
                <i data-feather="loader" class="spinner"></i>
            `;
        } else {
            submitBtn.innerHTML = `
                Submit for Verification
                <i data-feather="arrow-right"></i>
            `;
        }
        
        feather.replace();
    }
}
