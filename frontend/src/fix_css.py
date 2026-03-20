import codecs

css_content = """}

/* =========================================
   5. SLIDING AUTH STYLES
   ========================================= */

.auth-master-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    margin: -20px 0 50px;
}

.auth-container {
    background-color: var(--card);
    border-radius: 20px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
    width: 900px;
    max-width: 100%;
    min-height: 600px;
    transition: all 0.6s ease-in-out;
}

.auth-form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
}

.auth-form {
    background-color: var(--card);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 50px;
    height: 100%;
    text-align: center;
}

.auth-input-group,
.auth-full-input,
.auth-role-selector input {
    background-color: var(--background);
    color: var(--text);
    border: 2px solid var(--border);
    padding: 12px 15px;
    margin: 8px 0;
    width: 100%;
    border-radius: 10px;
    font-size: 0.95rem;
}

.auth-input-group {
    display: flex;
    gap: 10px;
    background: transparent;
    padding: 0;
    border: none;
}

.auth-submit-btn {
    border-radius: 20px;
    border: 1px solid var(--primary);
    background-color: var(--primary);
    color: #FFFFFF;
    font-size: 1rem;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
    margin-top: 20px;
}

.auth-submit-btn:active {
    transform: scale(0.95);
}

.sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
}

.auth-container.right-panel-active .sign-in-container {
    transform: translateX(100%);
}

.sign-up-container {
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
}

.auth-container.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
}

@keyframes show {
    0%, 49.99% {
        opacity: 0;
        z-index: 1;
    }
    
    50%, 100% {
        opacity: 1;
        z-index: 5;
    }
}

.auth-overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 100;
}

.auth-container.right-panel-active .auth-overlay-container {
    transform: translateX(-100%);
}

.auth-overlay {
    background: linear-gradient(to right, var(--primary), var(--secondary));
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0 0;
    color: #FFFFFF;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.auth-container.right-panel-active .auth-overlay {
    transform: translateX(50%);
}

.auth-overlay-panel {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.auth-overlay-left {
    transform: translateX(-20%);
}

.auth-container.right-panel-active .auth-overlay-left {
    transform: translateX(0);
}

.auth-overlay-right {
    right: 0;
    transform: translateX(0);
}

.auth-container.right-panel-active .auth-overlay-right {
    transform: translateX(20%);
}

.auth-role-selector {
    display: flex;
    width: 100%;
    gap: 15px;
    margin: 10px 0;
}

.auth-role-selector label {
    flex: 1;
    padding: 10px;
    border: 2px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
}

.auth-role-selector label.active {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
}

.auth-role-selector input {
    display: none;
}

.auth-divider {
    font-size: 0.85rem;
    color: #a0aec0;
    margin: 15px 0;
}

.auth-brand-link {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 20px;
    display: inline-block;
}

.auth-social-container {
    margin: 15px 0;
}

.auth-error-toast {
    position: fixed;
    top: 20px;
    background: var(--error);
    color: white;
    padding: 15px 30px;
    border-radius: 10px;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    font-weight: 600;
}

.overlay-btn {
    border-radius: 20px;
    border: 2px solid #FFFFFF;
    background-color: transparent;
    color: #FFFFFF;
    font-size: 1rem;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
    margin-top: 20px;
}

.overlay-btn:hover {
    background: white;
    color: var(--primary);
}

/* Auth Mobile Responsiveness */
@media (max-width: 768px) {
    .auth-container {
        display: flex;
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        border-radius: 0;
    }

    .sign-in-container, .sign-up-container {
        width: 100%;
        position: relative;
        height: auto;
        padding: 40px 0;
    }

    .auth-overlay-container {
        display: none; /* Hide sliding overlay on very small screens, revert to stacked */
    }

    .auth-container.right-panel-active .sign-in-container {
        display: none;
    }
    .auth-container:not(.right-panel-active) .sign-up-container {
        display: none;
    }
}
"""

with open("c:/Users/Lenovo/.gemini/antigravity/playground/EventKonnect/frontend/src/style.css", "rb") as f:
    lines = f.readlines()

good_lines = lines[:1033]

with open("c:/Users/Lenovo/.gemini/antigravity/playground/EventKonnect/frontend/src/style.css", "wb") as f:
    f.writelines(good_lines)
    f.write(css_content.encode('utf-8'))
