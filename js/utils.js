// Utility functions
const utils = {
    showToast: (message) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    },
    
    formatCurrency: (amount) => {
        return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    formatDate: (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

