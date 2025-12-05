// Checkout Page JavaScript

// Default order items (3 dishes)
const orderItems = [
    { name: 'Chicken Biryani', price: 15.00 },
    { name: 'Beef Kabsa', price: 12.00 },
    { name: 'Mansaf', price: 18.00 }
];

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.08; // 8% tax

// DOM Elements
const checkoutForm = document.getElementById('checkoutForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
const cardFields = document.getElementById('cardFields');
const summaryItems = document.getElementById('summaryItems');
const subtotalEl = document.getElementById('subtotal');
const deliveryFeeEl = document.getElementById('deliveryFee');
const taxEl = document.getElementById('tax');
const totalPrice = document.getElementById('totalPrice');
const btnText = placeOrderBtn.querySelector('.btn-text');
const btnLoader = placeOrderBtn.querySelector('.btn-loader');

// Card preview elements
const cardNumberDisplay = document.getElementById('cardNumberDisplay');
const cardNameDisplay = document.getElementById('cardNameDisplay');
const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    generateOrderSummary();
    setupEventListeners();
    initializeCardPreview();
});

/**
 * Generate order summary from items array
 */
function generateOrderSummary() {
    summaryItems.innerHTML = '';
    
    let subtotal = 0;
    orderItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
        `;
        summaryItems.appendChild(itemElement);
        subtotal += item.price;
    });
    
    updateTotals(subtotal);
}

/**
 * Update all totals (subtotal, tax, delivery, total)
 */
function updateTotals(subtotal) {
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    deliveryFeeEl.textContent = `$${DELIVERY_FEE.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalPrice.textContent = `$${total.toFixed(2)}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Payment method change handler
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', toggleCardFields);
    });
    
    // Place order button
    placeOrderBtn.addEventListener('click', handlePlaceOrder);
    
    // Real-time validation
    document.getElementById('fullName').addEventListener('blur', validateFullName);
    document.getElementById('phone').addEventListener('blur', validatePhone);
    document.getElementById('address').addEventListener('blur', validateAddress);
    
    // Card field listeners
    const cardNumber = document.getElementById('cardNumber');
    const cardName = document.getElementById('cardName');
    const expiry = document.getElementById('expiry');
    const cvv = document.getElementById('cvv');
    
    cardNumber.addEventListener('input', handleCardNumberInput);
    cardNumber.addEventListener('blur', validateCardNumber);
    cardName.addEventListener('input', handleCardNameInput);
    cardName.addEventListener('blur', validateCardName);
    expiry.addEventListener('input', handleExpiryInput);
    expiry.addEventListener('blur', validateExpiry);
    cvv.addEventListener('input', handleCvvInput);
    cvv.addEventListener('blur', validateCVV);
}

/**
 * Initialize card preview with default values
 */
function initializeCardPreview() {
    updateCardPreview('', '', '');
}

/**
 * Toggle credit card fields based on payment method
 */
function toggleCardFields() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (selectedMethod === 'card') {
        cardFields.classList.add('show');
        // Focus first card field
        setTimeout(() => {
            document.getElementById('cardNumber').focus();
        }, 100);
    } else {
        cardFields.classList.remove('show');
        clearCardErrors();
        clearCardFields();
    }
}

/**
 * Handle card number input with formatting
 */
function handleCardNumberInput(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    
    if (formatted.length <= 19) {
        e.target.value = formatted;
        updateCardPreview(formatted, cardNameDisplay.textContent.replace('CARDHOLDER NAME', '').trim(), cardExpiryDisplay.textContent);
    }
}

/**
 * Handle card name input
 */
function handleCardNameInput(e) {
    let value = e.target.value.toUpperCase();
    updateCardPreview(cardNumberDisplay.textContent, value, cardExpiryDisplay.textContent);
}

/**
 * Handle expiry input with formatting
 */
function handleExpiryInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    if (value.length <= 5) {
        e.target.value = value;
        updateCardPreview(cardNumberDisplay.textContent, cardNameDisplay.textContent.replace('CARDHOLDER NAME', '').trim(), value);
    }
}

/**
 * Handle CVV input (numbers only)
 */
function handleCvvInput(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
}

/**
 * card preview display
 */
function updateCardPreview(number, name, expiry) {
    cardNumberDisplay.textContent = number || '#### #### #### ####';
    cardNameDisplay.textContent = name || 'CARDHOLDER NAME';
    cardExpiryDisplay.textContent = expiry || 'MM/YY';
}

/**
 * Clear all card field error messages
 */
function clearCardErrors() {
    document.getElementById('cardNumberError').textContent = '';
    document.getElementById('cardNameError').textContent = '';
    document.getElementById('expiryError').textContent = '';
    document.getElementById('cvvError').textContent = '';
}

/**
 * Clear all card input fields
 */
function clearCardFields() {
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('expiry').value = '';
    document.getElementById('cvv').value = '';
    initializeCardPreview();
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    document.getElementById('fullNameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('addressError').textContent = '';
    clearCardErrors();
}

/**
 * Validate full name
 */
function validateFullName() {
    const fullName = document.getElementById('fullName');
    const fullNameError = document.getElementById('fullNameError');
    const value = fullName.value.trim();
    
    if (!value) {
        fullNameError.textContent = 'Full name is required';
        fullName.style.borderColor = 'var(--error-color)';
        return false;
    } else if (value.length < 2) {
        fullNameError.textContent = 'Name must be at least 2 characters';
        fullName.style.borderColor = 'var(--error-color)';
        return false;
    } else {
        fullNameError.textContent = '';
        fullName.style.borderColor = '';
        return true;
    }
}

/**
 * Validate phone number
 */
function validatePhone() {
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const value = phone.value.trim();
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    
    if (!value) {
        phoneError.textContent = 'Phone number is required';
        phone.style.borderColor = 'var(--error-color)';
        return false;
    } else if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
        phoneError.textContent = 'Please enter a valid phone number';
        phone.style.borderColor = 'var(--error-color)';
        return false;
    } else {
        phoneError.textContent = '';
        phone.style.borderColor = '';
        return true;
    }
}

/**
 * Validate address
 */
function validateAddress() {
    const address = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    const value = address.value.trim();
    
    if (!value) {
        addressError.textContent = 'Address is required';
        address.style.borderColor = 'var(--error-color)';
        return false;
    } else if (value.length < 10) {
        addressError.textContent = 'Please enter a complete address';
        address.style.borderColor = 'var(--error-color)';
        return false;
    } else {
        addressError.textContent = '';
        address.style.borderColor = '';
        return true;
    }
}

/**
 * Validate card number
 */
function validateCardNumber() {
    const cardNumber = document.getElementById('cardNumber');
    const cardNumberError = document.getElementById('cardNumberError');
    const value = cardNumber.value.replace(/\s/g, '');
    
    if (!value) {
        cardNumberError.textContent = 'Card number is required';
        return false;
    } else if (value.length < 13 || value.length > 19) {
        cardNumberError.textContent = 'Card number must be 13-19 digits';
        return false;
    } else if (!isValidCardNumber(value)) {
        cardNumberError.textContent = 'Invalid card number';
        return false;
    } else {
        cardNumberError.textContent = '';
        return true;
    }
}

/**
 * Validate card name
 */
function validateCardName() {
    const cardName = document.getElementById('cardName');
    const cardNameError = document.getElementById('cardNameError');
    const value = cardName.value.trim();
    
    if (!value) {
        cardNameError.textContent = 'Cardholder name is required';
        return false;
    } else if (value.length < 2) {
        cardNameError.textContent = 'Name must be at least 2 characters';
        return false;
    } else {
        cardNameError.textContent = '';
        return true;
    }
}

/**
 * Validate expiry date
 */
function validateExpiry() {
    const expiry = document.getElementById('expiry');
    const expiryError = document.getElementById('expiryError');
    const value = expiry.value.trim();
    const parts = value.split('/');
    
    if (!value) {
        expiryError.textContent = 'Expiry date is required';
        return false;
    } else if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
        expiryError.textContent = 'Please use MM/YY format';
        return false;
    } else {
        const month = parseInt(parts[0]);
        const year = parseInt('20' + parts[1]);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        if (month < 1 || month > 12) {
            expiryError.textContent = 'Invalid month';
            return false;
        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
            expiryError.textContent = 'Card has expired';
            return false;
        } else {
            expiryError.textContent = '';
            return true;
        }
    }
}

/**
 * Validate CVV
 */
function validateCVV() {
    const cvv = document.getElementById('cvv');
    const cvvError = document.getElementById('cvvError');
    const value = cvv.value.trim();
    
    if (!value) {
        cvvError.textContent = 'CVV is required';
        return false;
    } else if (value.length < 3 || value.length > 4) {
        cvvError.textContent = 'CVV must be 3 or 4 digits';
        return false;
    } else {
        cvvError.textContent = '';
        return true;
    }
}

/**
 * Simple Luhn algorithm check for card number validation
 */
function isValidCardNumber(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Validate all form fields
 * @returns {boolean} - true if valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    clearAllErrors();
    
    if (!validateFullName()) isValid = false;
    if (!validatePhone()) isValid = false;
    if (!validateAddress()) isValid = false;
    
    // Validate Credit Card fields if selected
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (selectedMethod === 'card') {
        if (!validateCardNumber()) isValid = false;
        if (!validateCardName()) isValid = false;
        if (!validateExpiry()) isValid = false;
        if (!validateCVV()) isValid = false;
    }
    
    return isValid;
}

/**
 * Show loading state on button
 */
function setButtonLoading(loading) {
    if (loading) {
        placeOrderBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        placeOrderBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Handle place order button click
 */
function handlePlaceOrder() {
    // Validate form
    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.error-message:not(:empty)');
        if (firstError) {
            firstError.closest('.form-group').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        return;
    }
    
    // Show loading state
    setButtonLoading(true);
    
    // Collect form data
    const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;
    
    const formData = {
        userInfo: {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim()
        },
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        cardInfo: null,
        orderItems: orderItems,
        totals: {
            subtotal: subtotal,
            deliveryFee: DELIVERY_FEE,
            tax: tax,
            total: total
        }
    };
    
    // Add card info if credit card selected
    if (formData.paymentMethod === 'card') {
        formData.cardInfo = {
            cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            cardName: document.getElementById('cardName').value.trim(),
            expiry: document.getElementById('expiry').value.trim(),
            cvv: document.getElementById('cvv').value.trim()
        };
    }
    
    // Log order data to console
    console.log('Order Data:', formData);
    
    // Simulate processing delay
    setTimeout(() => {
        // Store order data in sessionStorage for tracking page
        sessionStorage.setItem('orderData', JSON.stringify(formData));
        // Redirect to order tracking page
        window.location.href = 'order-tracking.html';
    }, 1500);
}
