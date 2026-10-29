// customer-auth.js
import { supabase } from './src/supabase.js';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const nameInput = document.getElementById('loginName');
const nameGroup = document.getElementById('name-group');
const submitBtn = document.getElementById('loginButton');
const modeBtn = document.getElementById('modeButton');
const toggleText = document.getElementById('auth-toggle-text') || document.getElementById('toggleText'); // fallback
const subtitle = document.getElementById('loginSubtitle');
const errorMsg = document.getElementById('loginMessage');
const successMsg = document.getElementById('loginMessage'); // same element, just use for success too
const togglePassword = document.getElementById('togglePassword');
const wrapper = document.querySelector('.login-double-card');
const formTitle = document.getElementById('formTitle');
const modeLabel = document.getElementById('modeLabel');

let isRegistering = false;

// --- 1. Toggle Password Visibility ---
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// --- 2. Mode Switch (Sign In <-> Create Account) ---
modeBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;

    // I-reset ang form at messages
    form.reset();
    errorMsg.textContent = "";
    
    if (isRegistering) {
        // Switch to Register Mode
        wrapper?.setAttribute('data-mode', 'register');
        if (modeLabel) modeLabel.textContent = "CREATE ACCOUNT";
        if (formTitle) formTitle.textContent = "Join us today";
        subtitle.textContent = "Register a new account to start managing your pets.";
        submitBtn.innerHTML = '<span class="icon">👤+</span> Create account';
        modeBtn.innerHTML = '<span class="icon">←</span> Back to sign in';
        
        // Ipakita ang Full Name field (CSS animation)
        if (nameGroup) {
            nameGroup.hidden = false;
            nameInput.required = true;
        }
    } else {
        // Switch to Sign In Mode
        wrapper?.setAttribute('data-mode', 'signin');
        if (modeLabel) modeLabel.textContent = "WELCOME BACK";
        if (formTitle) formTitle.textContent = "Welcome back";
        subtitle.textContent = "Glad to see you again. Log in to continue.";
        submitBtn.innerHTML = '<span class="icon">→</span> Sign in';
        modeBtn.innerHTML = '<span class="icon">👤+</span> Create an account';
        
        // Itago ang Full Name field
        if (nameGroup) {
            nameGroup.hidden = true;
            nameInput.required = false;
        }
    }
    
    // I-update ang password autocomplete
    passwordInput.autocomplete = isRegistering ? "new-password" : "current-password";
    passwordInput.minLength = isRegistering ? 8 : 6;
});

// --- 3. Handle Form Submit ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset messages
    errorMsg.textContent = "";
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.textContent = isRegistering ? "Creating..." : "Signing in...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const fullName = nameInput ? nameInput.value.trim() : "";

    try {
        if (isRegistering) {
            // --- CREATE ACCOUNT ---
            if (!fullName) throw new Error("Please enter your full name.");
            if (password.length < 8) throw new Error("Password must be at least 8 characters.");

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            // Kapag kailangan ng email confirmation, i-show ito
            if (data.user && !data.session) {
                errorMsg.style.color = "var(--ok)";
                errorMsg.textContent = "Success! Please check your email to confirm.";
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                return;
            }

            errorMsg.style.color = "var(--ok)";
            errorMsg.textContent = "Account created! Redirecting...";
            
            setTimeout(() => {
                window.location.replace("/Customer.html");
            }, 1500);

        } else {
            // --- SIGN IN ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw new Error("Invalid email or password.");
            
            errorMsg.style.color = "var(--ok)";
            errorMsg.textContent = "Welcome back! Redirecting...";
            
            setTimeout(() => {
                window.location.replace("/Customer.html");
            }, 1500);
        }
    } catch (err) {
        errorMsg.style.color = "var(--danger)";
        errorMsg.textContent = err.message || "An error occurred.";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
});