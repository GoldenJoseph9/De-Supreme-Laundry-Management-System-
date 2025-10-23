// Data storage using localStorage
const storage = {
    get: (key) => {
        const item = localStorage.getItem(`freshwash_${key}`);
        return item ? JSON.parse(item) : null;
    },
    
    set: (key, value) => {
        localStorage.setItem(`freshwash_${key}`, JSON.stringify(value));
    },
    
    remove: (key) => {
        localStorage.removeItem(`freshwash_${key}`);
    },
    
    clear: () => {
        // Only clear FreshWash data, not everything
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('freshwash_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Initialize EMPTY data structures - NO DEMO DATA
if (!storage.get('customers')) {
    storage.set('customers', []); // Empty array - no demo customers
}

if (!storage.get('transactions')) {
    storage.set('transactions', []);
}

if (!storage.get('appointments')) {
    storage.set('appointments', []);
}

if (!storage.get('activities')) {
    storage.set('activities', [{
        id: Date.now(),
        type: "system", 
        title: "Welcome to FreshWash Pro", 
        description: "Start by adding your first customer in the CRM section", 
        timestamp: "Just now", 
        icon: "tshirt", 
        color: "#3498db"
    }]);
}