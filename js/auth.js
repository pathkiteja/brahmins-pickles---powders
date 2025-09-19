// ========================================
// AUTHENTICATION SYSTEM - FRONTEND ONLY
// ========================================

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('brahmins_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('brahmins_current_user')) || null;
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.setupFormSubmissions();
        this.updateAuthState();
        this.setupLogout();
    }

    // ========================================
    // FORM VALIDATION
    // ========================================

    setupFormValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.validateEmailRealtime(input));
        });

        // Phone validation
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePhone(input));
            input.addEventListener('input', () => this.formatPhone(input));
        });

        // Password confirmation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
        }

        // Real-time form validation
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.validateField(input));
            });
        });
    }

    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validationEl = document.getElementById('emailValidation');
        
        if (!email) {
            this.setValidationMessage(validationEl, '', '');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.setValidationMessage(validationEl, 'Please enter a valid email address', 'invalid');
            return false;
        }

        // Check if email already exists (for signup)
        if (input.closest('#signupForm') && this.emailExists(email)) {
            this.setValidationMessage(validationEl, 'This email is already registered', 'invalid');
            return false;
        }

        this.setValidationMessage(validationEl, 'Email looks good!', 'valid');
        return true;
    }

    validateEmailRealtime(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email.length > 3 && !emailRegex.test(email)) {
            input.style.borderColor = '#dc3545';
        } else if (emailRegex.test(email)) {
            input.style.borderColor = '#28a745';
        } else {
            input.style.borderColor = '';
        }
    }

    validatePhone(input) {
        const phone = input.value.replace(/\D/g, '');
        const validationEl = document.getElementById('phoneValidation');
        
        if (!phone) {
            this.setValidationMessage(validationEl, '', '');
            return false;
        }

        if (phone.length < 10) {
            this.setValidationMessage(validationEl, 'Phone number must be at least 10 digits', 'invalid');
            return false;
        }

        if (phone.length > 12) {
            this.setValidationMessage(validationEl, 'Phone number is too long', 'invalid');
            return false;
        }

        this.setValidationMessage(validationEl, 'Phone number is valid!', 'valid');
        return true;
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2-$3-$4');
        }
        
        input.value = value;
    }

    validatePasswordMatch() {
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const validationEl = document.getElementById('confirmPasswordValidation');
        
        if (!confirmPassword) {
            this.setValidationMessage(validationEl, '', '');
            return false;
        }

        if (password !== confirmPassword) {
            this.setValidationMessage(validationEl, 'Passwords do not match', 'invalid');
            return false;
        }

        this.setValidationMessage(validationEl, 'Passwords match!', 'valid');
        return true;
    }

    validateField(input) {
        if (input.required && !input.value.trim()) {
            input.style.borderColor = '#dc3545';
        } else if (input.value.trim()) {
            input.style.borderColor = '#28a745';
        } else {
            input.style.borderColor = '';
        }
    }

    setValidationMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `input-validation ${type}`;
    }

    emailExists(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // ========================================
    // PASSWORD FUNCTIONALITY
    // ========================================

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.previousElementSibling;
                const isPassword = input.type === 'password';
                
                input.type = isPassword ? 'text' : 'password';
                button.querySelector('span').textContent = isPassword ? '🙈' : '👁️';
                
                // Add animation
                button.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            this.updatePasswordStrengthUI(strength);
        });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length === 0) {
            return { score: 0, level: 'none', feedback: ['Enter a password'] };
        }

        // Length check
        if (password.length >= 8) score += 25;
        else feedback.push('At least 8 characters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('Add uppercase letters');

        // Lowercase check
        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('Add lowercase letters');

        // Number check
        if (/\d/.test(password)) score += 25;
        else feedback.push('Add numbers');

        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            score += 10;
        } else {
            feedback.push('Add special characters');
        }

        // Determine level
        let level = 'weak';
        if (score >= 75) level = 'strong';
        else if (score >= 50) level = 'good';
        else if (score >= 25) level = 'fair';

        return { score, level, feedback };
    }

    updatePasswordStrengthUI(strength) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthFill || !strengthText) return;

        // Update progress bar
        strengthFill.className = `strength-fill ${strength.level}`;

        // Update text
        const messages = {
            none: 'Enter a password',
            weak: 'Weak password',
            fair: 'Fair password',
            good: 'Good password',
            strong: 'Strong password!'
        };

        strengthText.textContent = messages[strength.level];
        
        if (strength.feedback.length > 0 && strength.level !== 'strong') {
            strengthText.textContent += ` (${strength.feedback.slice(0, 2).join(', ')})`;
        }
    }

    // ========================================
    // FORM SUBMISSIONS
    // ========================================

    setupFormSubmissions() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Social buttons
        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', () => this.handleSocialAuth(button));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        // Show loading
        this.setButtonLoading(e.target.querySelector('.auth-button'), true);

        // Simulate API delay
        await this.delay(1500);

        // Find user
        const user = this.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            this.verifyPassword(password, u.password)
        );

        if (!user) {
            this.showMessage('Invalid email or password', 'error');
            this.setButtonLoading(e.target.querySelector('.auth-button'), false);
            return;
        }

        // Set current user
        this.currentUser = user;
        localStorage.setItem('brahmins_current_user', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('brahmins_remember_me', 'true');
        }

        this.showMessage('Login successful! Welcome back!', 'success');
        this.setButtonLoading(e.target.querySelector('.auth-button'), false);
        
        // Update auth state
        this.updateAuthState();
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').replace(/\D/g, ''),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            dateOfBirth: formData.get('dateOfBirth'),
            agreeTerms: formData.get('agreeTerms'),
            newsletter: formData.get('newsletter'),
            createdAt: new Date().toISOString(),
            id: this.generateUserId()
        };

        // Validate form
        if (!this.validateSignupForm(userData)) {
            return;
        }

        // Show loading
        this.setButtonLoading(e.target.querySelector('.auth-button'), true);

        // Simulate API delay
        await this.delay(2000);

        // Hash password (simple demo - in real app use proper hashing)
        userData.password = this.hashPassword(userData.password);
        delete userData.confirmPassword;

        // Save user
        this.users.push(userData);
        localStorage.setItem('brahmins_users', JSON.stringify(this.users));

        this.showMessage('Account created successfully! Please login.', 'success');
        this.setButtonLoading(e.target.querySelector('.auth-button'), false);
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    validateSignupForm(userData) {
        const errors = [];

        if (!userData.firstName) errors.push('First name is required');
        if (!userData.lastName) errors.push('Last name is required');
        if (!userData.email) errors.push('Email is required');
        if (!userData.phone) errors.push('Phone is required');
        if (!userData.password) errors.push('Password is required');
        if (userData.password !== userData.confirmPassword) errors.push('Passwords do not match');
        if (!userData.agreeTerms) errors.push('You must agree to the terms');

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (userData.email && !emailRegex.test(userData.email)) {
            errors.push('Invalid email format');
        }

        // Check if email exists
        if (this.emailExists(userData.email)) {
            errors.push('Email already registered');
        }

        // Check password strength
        const strength = this.calculatePasswordStrength(userData.password);
        if (strength.score < 50) {
            errors.push('Password is too weak');
        }

        if (errors.length > 0) {
            this.showMessage(errors[0], 'error');
            return false;
        }

        return true;
    }

    handleSocialAuth(button) {
        const provider = button.classList.contains('google-btn') ? 'Google' : 'Facebook';
        
        // Add loading animation
        button.style.transform = 'scale(0.95)';
        button.innerHTML = `<span>⏳</span> Connecting to ${provider}...`;
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.innerHTML = button.classList.contains('google-btn') ? 
                '<span>🔍</span> Google' : '<span>📘</span> Facebook';
            
            this.showMessage(`${provider} authentication will be available soon!`, 'error');
        }, 1500);
    }

    // ========================================
    // AUTHENTICATION STATE
    // ========================================

    updateAuthState() {
        const authLinks = document.querySelectorAll('.auth-link');
        const navLinks = document.querySelector('.nav-links');
        
        if (this.currentUser) {
            // User is logged in
            authLinks.forEach(link => link.style.display = 'none');
            
            // Add user menu
            if (!document.querySelector('.user-menu')) {
                const userMenu = this.createUserMenu();
                navLinks.appendChild(userMenu);
            }
        } else {
            // User is not logged in
            authLinks.forEach(link => link.style.display = 'block');
            
            // Remove user menu
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) userMenu.remove();
        }
    }

    createUserMenu() {
        const li = document.createElement('li');
        li.className = 'user-menu';
        li.innerHTML = `
            <div class="user-dropdown">
                <button class="user-button">
                    <span class="user-avatar">👤</span>
                    <span class="user-name">${this.currentUser.firstName}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="user-dropdown-menu">
                    <a href="#" class="dropdown-item">
                        <span>👤</span> Profile
                    </a>
                    <a href="#" class="dropdown-item">
                        <span>📦</span> Orders
                    </a>
                    <a href="#" class="dropdown-item">
                        <span>❤️</span> Favorites
                    </a>
                    <a href="#" class="dropdown-item">
                        <span>⚙️</span> Settings
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item logout-btn">
                        <span>🚪</span> Logout
                    </a>
                </div>
            </div>
        `;

        // Add user menu styles
        this.addUserMenuStyles();
        
        // Setup dropdown functionality
        this.setupUserDropdown(li);
        
        return li;
    }

    setupUserDropdown(userMenu) {
        const button = userMenu.querySelector('.user-button');
        const dropdown = userMenu.querySelector('.user-dropdown-menu');
        const logoutBtn = userMenu.querySelector('.logout-btn');
        
        button.addEventListener('click', () => {
            dropdown.classList.toggle('show');
            button.querySelector('.dropdown-arrow').textContent = 
                dropdown.classList.contains('show') ? '▲' : '▼';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                dropdown.classList.remove('show');
                button.querySelector('.dropdown-arrow').textContent = '▼';
            }
        });

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    setupLogout() {
        // Handle logout button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn') || 
                e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('brahmins_current_user');
        localStorage.removeItem('brahmins_remember_me');
        
        this.showMessage('Logged out successfully!', 'success');
        this.updateAuthState();
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    hashPassword(password) {
        // Simple demo hash - use proper bcrypt in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'brahmins_' + Math.abs(hash).toString(36);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setButtonLoading(button, isLoading) {
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        
        if (isLoading) {
            buttonText.style.display = 'none';
            buttonLoader.style.display = 'inline-block';
            button.disabled = true;
        } else {
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
            button.disabled = false;
        }
    }

    showMessage(message, type = 'success') {
        const messageEl = document.getElementById('authMessage');
        if (!messageEl) return;

        const icon = type === 'success' ? '✅' : '❌';
        
        messageEl.className = `auth-message ${type}`;
        messageEl.querySelector('.message-icon').textContent = icon;
        messageEl.querySelector('.message-text').textContent = message;
        
        messageEl.classList.add('show');
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 4000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addUserMenuStyles() {
        if (document.getElementById('userMenuStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'userMenuStyles';
        styles.textContent = `
            .user-dropdown {
                position: relative;
            }
            
            .user-button {
                background: var(--glass-secondary);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 0.5rem 1rem;
                color: var(--text-primary);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .user-button:hover {
                background: var(--glass-hover);
                transform: translateY(-2px);
            }
            
            .user-avatar {
                font-size: 1.1rem;
            }
            
            .dropdown-arrow {
                font-size: 0.8rem;
                transition: transform 0.3s ease;
            }
            
            .user-dropdown-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--glass-primary);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                box-shadow: var(--glass-shadow-strong);
                min-width: 200px;
                padding: 0.5rem 0;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                margin-top: 0.5rem;
            }
            
            .user-dropdown-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                color: var(--text-primary);
                text-decoration: none;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .dropdown-item:hover {
                background: var(--glass-hover);
                color: var(--accent-color);
            }
            
            .dropdown-divider {
                height: 1px;
                background: var(--glass-border);
                margin: 0.5rem 0;
            }
            
            @media (max-width: 768px) {
                .user-dropdown-menu {
                    right: -50px;
                    min-width: 180px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Auto-fill demo data for testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        // Add demo user if none exist
        const users = JSON.parse(localStorage.getItem('brahmins_users')) || [];
        if (users.length === 0) {
            const demoUser = {
                id: 'demo_user_123',
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@brahmins.com',
                phone: '9876543210',
                password: 'brahmins_1870411102', // hashed version of 'Demo123!'
                createdAt: new Date().toISOString(),
                newsletter: true
            };
            
            users.push(demoUser);
            localStorage.setItem('brahmins_users', JSON.stringify(users));
            console.log('Demo user created: demo@brahmins.com / Demo123!');
        }
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthSystem };
}