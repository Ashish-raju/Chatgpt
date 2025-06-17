class RoleSelection {
    constructor(app) {
        this.app = app;
        this.selectedRole = null;
    }

    render() {
        return `
            <div class="role-selection">
                <div class="role-header">
                    <h1>Choose Your Role</h1>
                    <p>How would you like to use Rider-Seeker?</p>
                </div>

                <div class="role-options">
                    <div class="role-card" data-role="rider">
                        <div class="role-icon">
                            <i data-feather="car" class="icon"></i>
                        </div>
                        <h3>I'm a Rider</h3>
                        <p>I want to offer rides and meet new people along the way</p>
                        <ul class="role-features">
                            <li><i data-feather="check"></i> Earn money from rides</li>
                            <li><i data-feather="check"></i> Meet compatible passengers</li>
                            <li><i data-feather="check"></i> Control your schedule</li>
                            <li><i data-feather="check"></i> Verified driver status</li>
                        </ul>
                        <div class="role-select-btn">
                            <i data-feather="arrow-right"></i>
                        </div>
                    </div>

                    <div class="role-card" data-role="seeker">
                        <div class="role-icon">
                            <i data-feather="users" class="icon"></i>
                        </div>
                        <h3>I'm a Seeker</h3>
                        <p>I want to find rides and potentially connect with drivers</p>
                        <ul class="role-features">
                            <li><i data-feather="check"></i> Affordable rides</li>
                            <li><i data-feather="check"></i> Meet interesting drivers</li>
                            <li><i data-feather="check"></i> Safe verified rides</li>
                            <li><i data-feather="check"></i> Social matching</li>
                        </ul>
                        <div class="role-select-btn">
                            <i data-feather="arrow-right"></i>
                        </div>
                    </div>
                </div>

                <div class="role-bottom">
                    <p class="role-note">
                        <i data-feather="info"></i>
                        You can always change your role later in settings
                    </p>
                    
                    <button id="continue-btn" class="btn btn-primary" disabled>
                        Continue
                        <i data-feather="arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    init() {
        this.setupRoleSelection();
        this.setupContinueButton();
    }

    setupRoleSelection() {
        const roleCards = document.querySelectorAll('.role-card');
        
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                roleCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                card.classList.add('active');
                
                // Store selected role
                this.selectedRole = card.dataset.role;
                
                // Enable continue button
                document.getElementById('continue-btn').disabled = false;
                
                // Add selection animation
                const icon = card.querySelector('.role-select-btn i');
                icon.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    icon.style.transform = 'translateX(0)';
                }, 200);
            });
        });
    }

    setupContinueButton() {
        document.getElementById('continue-btn').addEventListener('click', async () => {
            if (!this.selectedRole) {
                this.app.showError('Please select a role to continue');
                return;
            }

            try {
                // Save role to user profile
                await this.saveUserRole();
                this.app.userRole = this.selectedRole;
                this.app.showProfileCreation();
                
            } catch (error) {
                console.error('Error saving role:', error);
                this.app.showError('Failed to save role. Please try again.');
            }
        });
    }

    async saveUserRole() {
        const userId = this.app.currentUser.uid;
        
        await FirebaseService.updateUserProfile(userId, {
            role: this.selectedRole,
            createdAt: firebase.firestore.Timestamp.now(),
            profileComplete: false,
            isVerified: false
        });
    }
}
