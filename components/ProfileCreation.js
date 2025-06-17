class ProfileCreation {
    constructor(app) {
        this.app = app;
        this.uploadedPhotos = [];
        this.currentStep = 1;
        this.totalSteps = 3;
        this.profileData = {
            name: '',
            age: '',
            bio: '',
            hobbies: [],
            habits: [],
            personalityTraits: []
        };
    }

    render() {
        return `
            <div class="profile-creation">
                <div class="profile-header">
                    <button class="back-btn" id="back-btn">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                        </div>
                        <span class="progress-text">Step ${this.currentStep} of ${this.totalSteps}</span>
                    </div>
                    <div class="skip-btn" id="skip-btn">Skip</div>
                </div>

                <div class="profile-content">
                    <div id="step-1" class="profile-step ${this.currentStep === 1 ? 'active' : ''}">
                        <h2>Add Your Photos</h2>
                        <p>Add up to 5 photos to show your personality</p>
                        
                        <div class="photo-grid">
                            <div class="photo-slot main-photo ${this.uploadedPhotos.length > 0 ? 'has-photo' : ''}" data-index="0">
                                ${this.uploadedPhotos[0] ? 
                                    `<img src="${this.uploadedPhotos[0]}" alt="Profile photo">
                                     <button class="photo-remove" data-index="0"><i data-feather="x"></i></button>` :
                                    `<div class="photo-placeholder">
                                        <i data-feather="camera"></i>
                                        <span>Main Photo</span>
                                     </div>`
                                }
                            </div>
                            
                            ${Array.from({length: 4}, (_, i) => {
                                const index = i + 1;
                                return `
                                    <div class="photo-slot ${this.uploadedPhotos[index] ? 'has-photo' : ''}" data-index="${index}">
                                        ${this.uploadedPhotos[index] ? 
                                            `<img src="${this.uploadedPhotos[index]}" alt="Profile photo">
                                             <button class="photo-remove" data-index="${index}"><i data-feather="x"></i></button>` :
                                            `<div class="photo-placeholder">
                                                <i data-feather="plus"></i>
                                             </div>`
                                        }
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <input type="file" id="photo-input" accept="image/*" style="display: none;" multiple>
                    </div>

                    <div id="step-2" class="profile-step ${this.currentStep === 2 ? 'active' : ''}">
                        <h2>Basic Information</h2>
                        <p>Tell us a bit about yourself</p>
                        
                        <form class="profile-form">
                            <div class="input-group">
                                <label for="name-input">Full Name</label>
                                <input type="text" id="name-input" placeholder="Enter your full name" value="${this.profileData.name}" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="age-input">Age</label>
                                <input type="number" id="age-input" placeholder="Enter your age" min="18" max="99" value="${this.profileData.age}" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="bio-input">Bio</label>
                                <textarea id="bio-input" placeholder="Tell others about yourself..." maxlength="500" rows="4">${this.profileData.bio}</textarea>
                                <div class="char-count">
                                    <span id="bio-count">${this.profileData.bio.length}</span>/500
                                </div>
                            </div>
                        </form>
                    </div>

                    <div id="step-3" class="profile-step ${this.currentStep === 3 ? 'active' : ''}">
                        <h2>Your Interests</h2>
                        <p>Select your hobbies, habits, and personality traits</p>
                        
                        <div class="interests-section">
                            <h3>Hobbies</h3>
                            <div class="tag-grid" id="hobbies-grid">
                                ${this.renderTagOptions('hobbies', [
                                    'Photography', 'Travel', 'Music', 'Reading', 'Sports', 'Cooking',
                                    'Movies', 'Gaming', 'Art', 'Dancing', 'Hiking', 'Fitness'
                                ])}
                            </div>
                        </div>
                        
                        <div class="interests-section">
                            <h3>Habits</h3>
                            <div class="tag-grid" id="habits-grid">
                                ${this.renderTagOptions('habits', [
                                    'Non-smoker', 'Social drinker', 'Vegetarian', 'Early bird', 'Night owl',
                                    'Pet lover', 'Fitness enthusiast', 'Coffee lover', 'Tea lover'
                                ])}
                            </div>
                        </div>
                        
                        <div class="interests-section">
                            <h3>Personality</h3>
                            <div class="tag-grid" id="personality-grid">
                                ${this.renderTagOptions('personalityTraits', [
                                    'Outgoing', 'Introverted', 'Funny', 'Serious', 'Adventurous',
                                    'Calm', 'Creative', 'Analytical', 'Optimistic', 'Thoughtful'
                                ])}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-footer">
                    <button class="btn btn-secondary" id="prev-btn" ${this.currentStep === 1 ? 'style="visibility: hidden;"' : ''}>
                        <i data-feather="arrow-left"></i>
                        Previous
                    </button>
                    
                    <button class="btn btn-primary" id="next-btn">
                        ${this.currentStep === this.totalSteps ? 'Complete Profile' : 'Next'}
                        ${this.currentStep !== this.totalSteps ? '<i data-feather="arrow-right"></i>' : ''}
                    </button>
                </div>
            </div>
        `;
    }

    renderTagOptions(category, options) {
        return options.map(option => {
            const isSelected = this.profileData[category].includes(option);
            return `
                <div class="tag-option ${isSelected ? 'selected' : ''}" data-category="${category}" data-value="${option}">
                    ${option}
                </div>
            `;
        }).join('');
    }

    init() {
        this.setupPhotoUpload();
        this.setupFormInputs();
        this.setupTagSelection();
        this.setupNavigation();
    }

    setupPhotoUpload() {
        const photoSlots = document.querySelectorAll('.photo-slot');
        const photoInput = document.getElementById('photo-input');
        
        photoSlots.forEach(slot => {
            slot.addEventListener('click', (e) => {
                if (e.target.classList.contains('photo-remove')) {
                    return; // Let remove button handle this
                }
                photoInput.click();
            });
        });

        // Handle remove photo buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.photo-remove')) {
                const index = parseInt(e.target.closest('.photo-remove').dataset.index);
                this.removePhoto(index);
            }
        });

        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });
    }

    async handlePhotoUpload(files) {
        for (let file of files) {
            if (this.uploadedPhotos.length >= 5) {
                this.app.showError('You can upload maximum 5 photos');
                break;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                this.app.showError('Photo size should be less than 5MB');
                continue;
            }

            try {
                const dataUrl = await this.fileToDataUrl(file);
                this.uploadedPhotos.push(dataUrl);
                this.updatePhotoDisplay();
            } catch (error) {
                console.error('Error processing photo:', error);
                this.app.showError('Failed to process photo');
            }
        }
    }

    removePhoto(index) {
        this.uploadedPhotos.splice(index, 1);
        this.updatePhotoDisplay();
    }

    updatePhotoDisplay() {
        const photoSlots = document.querySelectorAll('.photo-slot');
        
        photoSlots.forEach((slot, index) => {
            const photo = this.uploadedPhotos[index];
            if (photo) {
                slot.classList.add('has-photo');
                slot.innerHTML = `
                    <img src="${photo}" alt="Profile photo">
                    <button class="photo-remove" data-index="${index}"><i data-feather="x"></i></button>
                `;
            } else {
                slot.classList.remove('has-photo');
                if (index === 0) {
                    slot.innerHTML = `
                        <div class="photo-placeholder">
                            <i data-feather="camera"></i>
                            <span>Main Photo</span>
                        </div>
                    `;
                } else {
                    slot.innerHTML = `
                        <div class="photo-placeholder">
                            <i data-feather="plus"></i>
                        </div>
                    `;
                }
            }
        });
        
        feather.replace();
    }

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    setupFormInputs() {
        const nameInput = document.getElementById('name-input');
        const ageInput = document.getElementById('age-input');
        const bioInput = document.getElementById('bio-input');
        const bioCount = document.getElementById('bio-count');

        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.profileData.name = e.target.value;
            });
        }

        if (ageInput) {
            ageInput.addEventListener('input', (e) => {
                this.profileData.age = e.target.value;
            });
        }

        if (bioInput) {
            bioInput.addEventListener('input', (e) => {
                this.profileData.bio = e.target.value;
                if (bioCount) {
                    bioCount.textContent = e.target.value.length;
                }
            });
        }
    }

    setupTagSelection() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-option')) {
                const category = e.target.dataset.category;
                const value = e.target.dataset.value;
                
                if (e.target.classList.contains('selected')) {
                    // Remove from selection
                    const index = this.profileData[category].indexOf(value);
                    if (index > -1) {
                        this.profileData[category].splice(index, 1);
                    }
                    e.target.classList.remove('selected');
                } else {
                    // Add to selection
                    this.profileData[category].push(value);
                    e.target.classList.add('selected');
                }
            }
        });
    }

    setupNavigation() {
        document.getElementById('back-btn').addEventListener('click', () => {
            this.app.goBack();
        });

        document.getElementById('skip-btn').addEventListener('click', () => {
            this.completeProfile();
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextStep();
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateStepDisplay();
            }
        } else {
            this.completeProfile();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (this.uploadedPhotos.length === 0) {
                    this.app.showError('Please add at least one photo');
                    return false;
                }
                return true;
            case 2:
                const name = document.getElementById('name-input').value.trim();
                const age = document.getElementById('age-input').value;
                
                if (!name) {
                    this.app.showError('Please enter your full name');
                    return false;
                }
                if (!age || age < 18 || age > 99) {
                    this.app.showError('Please enter a valid age (18-99)');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    updateStepDisplay() {
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        progressFill.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
        progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        
        // Update step visibility
        document.querySelectorAll('.profile-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });
        
        // Update button visibility
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
        nextBtn.innerHTML = this.currentStep === this.totalSteps ? 
            'Complete Profile' : 
            'Next <i data-feather="arrow-right"></i>';
        
        feather.replace();
    }

    async completeProfile() {
        try {
            // Upload photos to Firebase Storage
            const photoUrls = await this.uploadPhotosToStorage();
            
            // Save profile data
            await this.saveProfileData(photoUrls);
            
            this.app.showSuccess('Profile created successfully!');
            
            // Redirect based on role
            if (this.app.userRole === 'rider') {
                this.app.showKYCVerification();
            } else {
                this.app.showDashboard();
            }
            
        } catch (error) {
            console.error('Error completing profile:', error);
            this.app.showError('Failed to save profile. Please try again.');
        }
    }

    async uploadPhotosToStorage() {
        const photoUrls = [];
        const userId = this.app.currentUser.uid;
        
        for (let i = 0; i < this.uploadedPhotos.length; i++) {
            try {
                // Convert data URL to blob
                const response = await fetch(this.uploadedPhotos[i]);
                const blob = await response.blob();
                
                // Upload to Firebase Storage
                const photoRef = firebase.storage().ref(`users/${userId}/photos/photo_${i}.jpg`);
                const snapshot = await photoRef.put(blob);
                const downloadUrl = await snapshot.ref.getDownloadURL();
                
                photoUrls.push(downloadUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
                throw error;
            }
        }
        
        return photoUrls;
    }

    async saveProfileData(photoUrls) {
        const userId = this.app.currentUser.uid;
        
        await FirebaseService.updateUserProfile(userId, {
            ...this.profileData,
            photos: photoUrls,
            profileComplete: true,
            updatedAt: firebase.firestore.Timestamp.now()
        });
    }
}
