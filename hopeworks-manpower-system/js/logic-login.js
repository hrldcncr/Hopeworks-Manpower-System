// Kunin natin ang mga elements mula sa HTML
const togglePassword = document.querySelector('#togglePassword');
const passwordField = document.querySelector('#passwordField');

// Maglagay ng "listener"
togglePassword.addEventListener('click', function () {
    
    // 1. I-check at i-switch ang input type
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    
    // 2. Siguraduhin na isa lang ang active na class sa bawat click
    // I-toggle natin ang 'fa-eye' at 'fa-eye-slash' nang sabay
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});