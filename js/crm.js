// Professional CRM Management System
const crm = {
    currentCustomer: null,
    filters: {
        status: 'all',
        preferences: 'all',
        search: ''
    },

    init: function() {
        this.renderCustomerTable();
        this.bindEvents();
        this.initializeFilters();
    },

    bindEvents: function() {
        // Add customer button
        document.getElementById('add-customer-btn').addEventListener('click', () => {
            this.openCustomerModal();
        });

        // Export to Excel button
        document.getElementById('export-crm-btn').addEventListener('click', this.exportToExcel.bind(this));

        // Customer form submission
        document.getElementById('customer-form').addEventListener('submit', this.handleCustomerFormSubmit.bind(this));

        // Customer search with debounce
        document.getElementById('customer-search').addEventListener('input',
            utils.debounce((e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300)
        );

        // Filter events
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('preferences-filter').addEventListener('change', (e) => {
            this.filters.preferences = e.target.value;
            this.applyFilters();
        });

        // Close modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeCustomerModal();
        });

        // Close modal when clicking outside
        document.getElementById('add-customer-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeCustomerModal();
            }
        });

        // Bulk actions
        document.getElementById('bulk-status').addEventListener('change', this.handleBulkStatusChange.bind(this));
        document.getElementById('send-bulk-message').addEventListener('click', this.sendBulkMessage.bind(this));
    },

    initializeFilters: function() {
        // Initialize filter dropdowns
        const statusFilter = document.getElementById('status-filter');
        const preferencesFilter = document.getElementById('preferences-filter');
        
        if (!statusFilter) {
            this.createFilterSection();
        }
    },

    createFilterSection: function() {
        const crmCard = document.querySelector('#crm .card1');
        const filterSection = document.createElement('div');
        filterSection.className = 'filter-section';
        filterSection.innerHTML = `
            <div class="filter-grid">
                <div class="filter-group">
                    <label class="filter-label">Status</label>
                    <select class="filter-select" id="status-filter">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Service Preference</label>
                    <select class="filter-select" id="preferences-filter">
                        <option value="all">All Preferences</option>
                        <option value="wash-fold">Wash & Fold</option>
                        <option value="dry-cleaning">Dry Cleaning</option>
                        <option value="delivery">Delivery Service</option>
                        <option value="all">All Services</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Quick Actions</label>
                    <div class="bulk-actions">
                        <span class="select-all" id="selected-count">0 selected</span>
                        <select class="filter-select" id="bulk-status" style="display: none;">
                            <option value="">Change Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="premium">Premium</option>
                        </select>
                        <button class="btn btn-secondary" id="send-bulk-message" style="display: none;">
                            <i class="fas fa-envelope"></i> Message Selected
                        </button>
                    </div>
                </div>
            </div>
        `;
        crmCard.insertBefore(filterSection, crmCard.querySelector('.customer-table'));
    },

    renderCustomerTable: function(customers = null) {
        const allCustomers = customers || storage.get('customers') || [];
        const customerTableBody = document.getElementById('customer-table-body');
        
        if (allCustomers.length === 0) {
            customerTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h3>No Customers Found</h3>
                            <p>Get started by adding your first customer</p>
                            <button class="btn btn-secondary" onclick="crm.openCustomerModal()">
                                <i class="fas fa-plus"></i> Add First Customer
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        customerTableBody.innerHTML = '';

        allCustomers.forEach(customer => {
            const row = document.createElement('tr');
            row.dataset.customerId = customer.id;
            row.innerHTML = this.createCustomerRowHTML(customer);
            customerTableBody.appendChild(row);
        });

        this.updateSelectedCount();
    },

    createCustomerRowHTML: function(customer) {
        const tags = this.generateCustomerTags(customer);
        const lastContact = this.getLastContactInfo(customer);
        
        return `
            <td>
                <div style="font-weight: 600;">${customer.name}</div>
                <div style="font-size: 0.8rem; color: var(--gray);">${lastContact}</div>
                ${tags}
            </td>
            <td>
                <div>${customer.phone}</div>
                <div style="font-size: 0.8rem; color: var(--gray);">${customer.email || 'No email'}</div>
            </td>
            <td>
                <span class="status status-${customer.status}">
                    ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="text-transform: capitalize;">${customer.preferences.replace('-', ' ')}</div>
            </td>
            <td>${utils.formatDate(customer.lastVisit)}</td>
            <td class="action-cell">
                <i class="fas fa-edit action-icon action-edit" 
                   title="Edit Customer" 
                   onclick="crm.editCustomer('${customer.id}')"></i>
                <i class="fab fa-whatsapp action-icon action-message" 
                   title="Message on WhatsApp" 
                   onclick="crm.messageCustomer('${customer.id}')"></i>
                <i class="fas fa-envelope action-icon action-email" 
                   title="Send Email" 
                   onclick="crm.emailCustomer('${customer.id}')"></i>
                <i class="fas fa-eye action-icon action-view" 
                   title="View Details" 
                   onclick="crm.viewCustomerDetails('${customer.id}')"></i>
            </td>
        `;
    },

    generateCustomerTags: function(customer) {
        const tags = [];
        if (customer.lastVisit) {
            const lastVisit = new Date(customer.lastVisit);
            const daysSinceVisit = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24));
            
            if (daysSinceVisit > 30) {
                tags.push('<span class="tag" style="background: #fff3cd; color: #856404;">Inactive</span>');
            }
        }
        
        if (customer.status === 'premium') {
            tags.push('<span class="tag" style="background: #e8f6ef; color: var(--secondary);">Premium</span>');
        }
        
        return tags.length ? `<div class="customer-tags">${tags.join('')}</div>` : '';
    },

    getLastContactInfo: function(customer) {
        if (!customer.lastContact) return 'No contact yet';
        
        const lastContact = new Date(customer.lastContact);
        const now = new Date();
        const diffTime = Math.abs(now - lastContact);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Contacted yesterday';
        if (diffDays < 7) return `Contacted ${diffDays} days ago`;
        if (diffDays < 30) return `Contacted ${Math.floor(diffDays / 7)} weeks ago`;
        return `Contacted ${Math.floor(diffDays / 30)} months ago`;
    },

    applyFilters: function() {
        let customers = storage.get('customers') || [];
        
        // Apply search filter
        if (this.filters.search) {
            customers = customers.filter(customer => 
                customer.name.toLowerCase().includes(this.filters.search) ||
                customer.email?.toLowerCase().includes(this.filters.search) ||
                customer.phone.includes(this.filters.search) ||
                customer.address?.toLowerCase().includes(this.filters.search)
            );
        }
        
        // Apply status filter
        if (this.filters.status !== 'all') {
            customers = customers.filter(customer => customer.status === this.filters.status);
        }
        
        // Apply preferences filter
        if (this.filters.preferences !== 'all') {
            customers = customers.filter(customer => customer.preferences === this.filters.preferences);
        }
        
        this.renderCustomerTable(customers);
    },

    openCustomerModal: function(customer = null) {
        this.currentCustomer = customer;
        const modal = document.getElementById('add-customer-modal');
        const form = document.getElementById('customer-form');
        const title = modal.querySelector('h3');
        
        if (customer) {
            title.textContent = 'Edit Customer';
            this.populateForm(customer);
        } else {
            title.textContent = 'Add New Customer';
            form.reset();
            // Hide status field for new customers
            document.getElementById('status-field').style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    closeCustomerModal: function() {
        document.getElementById('add-customer-modal').classList.remove('active');
        this.currentCustomer = null;
    },

    populateForm: function(customer) {
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-preferences').value = customer.preferences;
        document.getElementById('customer-status').value = customer.status;
        
        // Show status field for editing
        document.getElementById('status-field').style.display = 'block';
    },

    handleCustomerFormSubmit: function(e) {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value,
            address: document.getElementById('customer-address').value,
            preferences: document.getElementById('customer-preferences').value,
            status: this.currentCustomer ? document.getElementById('customer-status').value : 'active',
            lastVisit: new Date().toISOString().split('T')[0],
            lastContact: new Date().toISOString(),
            notes: this.currentCustomer ? this.currentCustomer.notes || [] : [],
            tags: this.currentCustomer ? this.currentCustomer.tags || [] : []
        };

        if (this.currentCustomer) {
            // Update existing customer
            this.updateCustomer(this.currentCustomer.id, customerData);
        } else {
            // Add new customer
            this.addCustomer(customerData);
        }
        
        this.closeCustomerModal();
    },

    addCustomer: function(customerData) {
        const customers = storage.get('customers') || [];
        const newCustomer = {
            id: utils.generateId(),
            ...customerData,
            createdAt: new Date().toISOString(),
            totalSpent: 0
        };
        
        customers.push(newCustomer);
        storage.set('customers', customers);
        
        // Add activity
        if (typeof dashboard !== 'undefined') {
            dashboard.addActivity({
                id: utils.generateId(),
                type: "customer",
                title: "New Customer Added",
                description: `${newCustomer.name} added to CRM`,
                timestamp: "Just now",
                icon: "user-plus",
                color: "#e74c3c"
            });
        }
        
        this.renderCustomerTable();
        if (typeof dashboard !== 'undefined') {
            dashboard.updateDashboardStats();
        }
        utils.showToast('Customer added successfully!');
    },

    updateCustomer: function(customerId, customerData) {
        const customers = storage.get('customers') || [];
        const customerIndex = customers.findIndex(c => c.id === customerId);
        
        if (customerIndex !== -1) {
            customers[customerIndex] = {
                ...customers[customerIndex],
                ...customerData,
                updatedAt: new Date().toISOString()
            };
            
            storage.set('customers', customers);
            this.renderCustomerTable();
            utils.showToast('Customer updated successfully!');
        }
    },

    editCustomer: function(customerId) {
        const customers = storage.get('customers') || [];
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
            this.openCustomerModal(customer);
        }
    },

    viewCustomerDetails: function(customerId) {
        console.log('🔍 Opening customer details for:', customerId);
        
        const customers = storage.get('customers') || [];
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
            this.showCustomerDetails(customer);
        } else {
            console.error('❌ Customer not found:', customerId);
            utils.showToast('Customer not found!');
        }
    },

    showCustomerDetails: function(customer) {
        // Create overlay and panel
        const overlay = document.createElement('div');
        overlay.className = 'customer-details-overlay';
        overlay.innerHTML = `
            <div class="customer-details-panel">
                <div class="details-header">
                    <h3>${customer.name}</h3>
                    <button class="close-details">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="details-grid">
                    <div class="detail-group">
                        <span class="detail-label">Contact Information</span>
                        <span class="detail-value">📱 ${customer.phone}</span>
                        <span class="detail-value">📧 ${customer.email || 'No email'}</span>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">📍 ${customer.address || 'No address provided'}</span>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Customer Status</span>
                        <span class="status status-${customer.status}">
                            ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Service Preference</span>
                        <span class="detail-value" style="text-transform: capitalize;">
                            🧼 ${customer.preferences.replace('-', ' ')}
                        </span>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Last Visit</span>
                        <span class="detail-value">📅 ${utils.formatDate(customer.lastVisit)}</span>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Last Contact</span>
                        <span class="detail-value">💬 ${this.getLastContactInfo(customer)}</span>
                    </div>
                </div>
                
                <div class="notes-section">
                    <h4>Customer Notes</h4>
                    <div class="notes-list" id="notes-list-${customer.id}">
                        ${this.renderCustomerNotes(customer.notes || [])}
                    </div>
                    <form class="note-form">
                        <textarea class="note-input" name="note" placeholder="Add a note about this customer..." required></textarea>
                        <button type="submit" class="btn btn-secondary">
                            <i class="fas fa-plus"></i> Add Note
                        </button>
                    </form>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn" onclick="crm.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i> Edit Customer
                    </button>
                    <button class="btn btn-secondary" onclick="crm.messageCustomer('${customer.id}')">
                        <i class="fab fa-whatsapp"></i> Send Message
                    </button>
                    <button class="btn" onclick="crm.emailCustomer('${customer.id}')" ${!customer.email ? 'disabled' : ''}>
                        <i class="fas fa-envelope"></i> Send Email
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => {
            overlay.classList.add('active');
            overlay.querySelector('.customer-details-panel').classList.add('active');
        }, 10);
        
        // Bind events
        this.bindDetailsPanelEvents(overlay, customer.id);
    },

    bindDetailsPanelEvents: function(overlay, customerId) {
        // Close button
        const closeBtn = overlay.querySelector('.close-details');
        closeBtn.addEventListener('click', () => {
            this.closeCustomerDetails();
        });
        
        // Overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeCustomerDetails();
            }
        });
        
        // Note form
        const noteForm = overlay.querySelector('.note-form');
        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const noteInput = e.target.querySelector('.note-input');
            if (noteInput && noteInput.value.trim()) {
                this.addCustomerNote(customerId, noteInput.value.trim());
                noteInput.value = '';
                
                // Update notes list
                const notesList = overlay.querySelector('.notes-list');
                const customers = storage.get('customers') || [];
                const customer = customers.find(c => c.id === customerId);
                if (customer) {
                    notesList.innerHTML = this.renderCustomerNotes(customer.notes || []);
                }
            }
        });
    },

    closeCustomerDetails: function() {
        const overlay = document.querySelector('.customer-details-overlay');
        if (overlay) {
            overlay.querySelector('.customer-details-panel').classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    },

    renderCustomerNotes: function(notes) {
        if (!notes || notes.length === 0) {
            return '<div style="text-align: center; color: var(--gray); padding: 20px;">No notes yet</div>';
        }
        
        return notes.map(note => `
            <div class="note-item">
                <div class="note-content">${note.content}</div>
                <div class="note-meta">
                    <span>${utils.formatDate(note.timestamp)}</span>
                    <span>${note.author || 'System'}</span>
                </div>
            </div>
        `).join('');
    },

    addCustomerNote: function(customerId, content) {
        const customers = storage.get('customers') || [];
        const customerIndex = customers.findIndex(c => c.id === customerId);
        
        if (customerIndex !== -1) {
            if (!customers[customerIndex].notes) {
                customers[customerIndex].notes = [];
            }
            
            customers[customerIndex].notes.unshift({
                id: utils.generateId(),
                content: content,
                timestamp: new Date().toISOString(),
                author: 'You'
            });
            
            storage.set('customers', customers);
            utils.showToast('Note added successfully!');
        }
    },

    messageCustomer: function(customerId) {
        const customers = storage.get('customers') || [];
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            // Update last contact
            this.updateLastContact(customerId);
            
            // Open WhatsApp
            const phone = customer.phone.replace(/\D/g, '');
            const message = `Hello ${customer.name}, trust you are having a wonderful day💯... `;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        }
    },

    emailCustomer: function(customerId) {
        const customers = storage.get('customers') || [];
        const customer = customers.find(c => c.id === customerId);
        if (customer && customer.email) {
            // Update last contact
            this.updateLastContact(customerId);
            
            const subject = 'De Supreme Laundry House - Customer Service';
            const body = `Dear ${customer.name},\n\nThank you for being our valued customer... Our great pleasure to be of service to you.`;
            window.open(`mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        } else {
            utils.showToast('No email address available for this customer');
        }
    },

    updateLastContact: function(customerId) {
        const customers = storage.get('customers') || [];
        const customerIndex = customers.findIndex(c => c.id === customerId);
        
        if (customerIndex !== -1) {
            customers[customerIndex].lastContact = new Date().toISOString();
            storage.set('customers', customers);
            this.renderCustomerTable();
        }
    },

    exportToExcel: function() {
        const customers = storage.get('customers') || [];
        if (customers.length === 0) {
            utils.showToast('No customer data to export');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Phone,Email,Address,Status,Preferences,Last Visit,Last Contact\n";
        
        customers.forEach(customer => {
            csvContent += `"${customer.name}","${customer.phone}","${customer.email || ''}","${customer.address || ''}","${customer.status}","${customer.preferences}","${customer.lastVisit}","${customer.lastContact || ''}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        utils.showToast('Customer data exported successfully!');
    },

    handleBulkStatusChange: function(e) {
        const newStatus = e.target.value;
        if (newStatus) {
            utils.showToast(`Bulk status change to ${newStatus} would be implemented here`);
            e.target.value = '';
        }
    },

    sendBulkMessage: function() {
        utils.showToast('Bulk messaging feature would be implemented here');
    },

    updateSelectedCount: function() {
        const selectedCount = document.querySelectorAll('.customer-select:checked').length;
        const selectedCountElement = document.getElementById('selected-count');
        if (selectedCountElement) {
            selectedCountElement.textContent = `${selectedCount} selected`;
        }
        
        const bulkStatus = document.getElementById('bulk-status');
        const bulkMessage = document.getElementById('send-bulk-message');
        
        if (bulkStatus && bulkMessage) {
            if (selectedCount > 0) {
                bulkStatus.style.display = 'inline-block';
                bulkMessage.style.display = 'inline-block';
            } else {
                bulkStatus.style.display = 'none';
                bulkMessage.style.display = 'none';
            }
        }
    }
};
