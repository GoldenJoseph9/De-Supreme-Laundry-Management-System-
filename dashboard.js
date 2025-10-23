// Dashboard Functions
const dashboard = {
    init: function() {
        this.updateDashboardStats();
        this.renderRecentActivities();
    },
    
    updateDashboardStats: function() {
        const customers = storage.get('customers');
        const activeCustomers = customers.filter(c => c.status === 'active').length;
        const newCustomers = customers.filter(c => {
            const lastVisit = new Date(c.lastVisit);
            const now = new Date();
            const diffTime = Math.abs(now - lastVisit);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        }).length;
        
        document.getElementById('active-customers').textContent = activeCustomers;
        document.getElementById('new-customers').textContent = newCustomers;
    },
    
    renderRecentActivities: function() {
        const activities = storage.get('activities');
        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon" style="background-color: ${activity.color};">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <p>${activity.description}</p>
                    <div class="activity-time">${activity.timestamp}</div>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    },
    
    addActivity: function(activity) {
        const activities = storage.get('activities');
        activities.unshift(activity);
        storage.set('activities', activities);
        this.renderRecentActivities();
    }
};

