// Order Tracking Page JavaScript

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const statusMessage = document.getElementById('statusMessage');
const statusBadge = document.getElementById('statusBadge');
const estimatedDelivery = document.getElementById('estimatedDelivery');
const progressFill = document.getElementById('progressFill');
const progressSteps = document.querySelectorAll('.progress-step');

// Time elements
const time1 = document.getElementById('time1');
const time2 = document.getElementById('time2');
const time3 = document.getElementById('time3');
const time4 = document.getElementById('time4');

// Order details elements
const orderNumber = document.getElementById('orderNumber');
const detailOrderNumber = document.getElementById('detailOrderNumber');
const detailOrderDate = document.getElementById('detailOrderDate');
const detailTotal = document.getElementById('detailTotal');
const detailPayment = document.getElementById('detailPayment');

// Action buttons
const newOrderBtn = document.getElementById('newOrderBtn');
const homeBtn = document.getElementById('homeBtn');

// Current status
let currentStep = 0;
let startTime = new Date();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    initializeTracking();
    updateEstimatedDelivery();
    startSimulation();
    setupActionButtons();
});

/**
 * Load order data from sessionStorage
 */
function loadOrderData() {
    const orderData = sessionStorage.getItem('orderData');
    if (orderData) {
        const data = JSON.parse(orderData);
        const orderNum = Math.floor(Math.random() * 90000) + 10000;
        orderNumber.textContent = orderNum;
        detailOrderNumber.textContent = `#${orderNum}`;
        detailOrderDate.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        detailTotal.textContent = `$${data.totals.total.toFixed(2)}`;
        detailPayment.textContent = data.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery';
    }
}

/**
 * Initialize tracking - set first step as active
 */
function initializeTracking() {
    // Set initial state
    step1.classList.add('active');
    step1.classList.remove('pending', 'completed');
    
    step2.classList.add('pending');
    step3.classList.add('pending');
    step4.classList.add('pending');
    
    // Set initial progress
    updateProgress(0);
    updateProgressSteps(1);
    
    // Set initial time
    time1.textContent = getCurrentTime();
    
    // Set initial status
    updateStatusBadge('pending', 'Order Placed');
    updateStatusMessage('Your order has been received and is being processed');
}

/**
 * Start tracking simulation
 */
function startSimulation() {
    // After 2 seconds: Preparing
    setTimeout(() => {
        updateStatus(1); // Step 1 completed, Step 2 active
        updateStatusBadge('active', 'Preparing');
        updateStatusMessage('Your food is being prepared with care');
    }, 2000);
    
    // After 4 seconds: Out for Delivery
    setTimeout(() => {
        updateStatus(2); // Step 2 completed, Step 3 active
        updateStatusBadge('active', 'On The Way');
        updateStatusMessage('Your order is on the way to you');
    }, 4000);
    
    // After 6 seconds: Delivered
    setTimeout(() => {
        updateStatus(3); // Step 3 completed, Step 4 active
        updateStatusBadge('completed', 'Delivered');
        updateStatusMessage('Your order has been successfully delivered! Enjoy your meal!');
        showCompletionAnimation();
    }, 6000);
}

/**
 * Update status based on step index
 * @param {number} stepIndex - Current active step (1-3, where 4 is final)
 */
function updateStatus(stepIndex) {
    currentStep = stepIndex;
    
    // Remove all classes first
    [step1, step2, step3, step4].forEach(step => {
        step.classList.remove('pending', 'active', 'completed');
    });
    
    // Mark previous steps as completed
    for (let i = 0; i < stepIndex; i++) {
        const step = [step1, step2, step3][i];
        if (step) {
            step.classList.add('completed');
        }
    }
    
    // Mark current step as active
    const currentStepElement = [step2, step3, step4][stepIndex - 1];
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        // Update time
        const timeElement = [time2, time3, time4][stepIndex - 1];
        if (timeElement) {
            timeElement.textContent = getCurrentTime();
        }
    }
    
    // If step 4 is active, mark it as completed too
    if (stepIndex === 3) {
        step4.classList.add('completed');
        time4.textContent = getCurrentTime();
    }
    
    // Update progress bar
    const progress = ((stepIndex + 1) / 4) * 100;
    updateProgress(progress);
    updateProgressSteps(stepIndex + 1);
}

/**
 * Update progress bar
 * @param {number} percentage - Progress percentage (0-100)
 */
function updateProgress(percentage) {
    progressFill.style.width = percentage + '%';
}

/**
 * Update progress step indicators
 * @param {number} activeStep - Current active step (1-4)
 */
function updateProgressSteps(activeStep) {
    progressSteps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < activeStep) {
            step.classList.add('completed');
        } else if (stepNum === activeStep) {
            step.classList.add('active');
        }
    });
}

/**
 * Update status badge
 */
function updateStatusBadge(status, text) {
    statusBadge.className = 'status-badge ' + status;
    statusBadge.textContent = text;
}

/**
 * Update status message text
 * @param {string} message - Status message to display
 */
function updateStatusMessage(message) {
    statusMessage.querySelector('p').textContent = message;
}

/**
 * Get current time formatted as "HH:MM AM/PM"
 */
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Update estimated delivery time
 */
function updateEstimatedDelivery() {
    const now = new Date();
    // Estimate 30-45 minutes from now
    const estimatedMinutes = 30 + Math.floor(Math.random() * 15);
    const estimated = new Date(now.getTime() + estimatedMinutes * 60000);
    
    let hours = estimated.getHours();
    const minutes = estimated.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    estimatedDelivery.textContent = `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Show completion animation
 */
function showCompletionAnimation() {
    // Add celebration effect
    step4.style.animation = 'bounce 0.6s ease';
    
    // Create confetti effect (simple version)
    createConfetti();
}

/**
 * Simple confetti effect
 */
function createConfetti() {
    const colors = ['#f01d59', '#4CAF50', '#ffc107', '#2196F3'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 50);
    }
    
    // Add confetti animation
    if (!document.getElementById('confettiStyle')) {
        const style = document.createElement('style');
        style.id = 'confettiStyle';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Setup action buttons event listeners
 */
function setupActionButtons() {
    // New Order button - redirect to checkout
    newOrderBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
    });
    
    // Home button - redirect to home page
    homeBtn.addEventListener('click', function() {
        // Try index.html first, then home.html
        window.location.href = '../bassant/home/index.html';
    });
}
