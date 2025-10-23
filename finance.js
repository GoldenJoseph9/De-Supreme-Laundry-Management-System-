// Practical Financial Management System
const finance = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    
    init: function() {
        this.initializeFinancialData();
        this.renderFinancialOverview();
        this.bindEvents();
    },
    
    initCharts: function() {
        this.renderRevenueChart();
        this.renderExpenseChart();
    },
    
    initializeFinancialData: function() {
        // Initialize only if empty
        if (!storage.get('financialRecords')) {
            storage.set('financialRecords', []);
        }
        
        if (!storage.get('financialGoals')) {
            storage.set('financialGoals', {
                monthlyRevenue: 10000,
                monthlyExpenses: 4000,
                targetProfit: 6000
            });
        }
    },
    
    bindEvents: function() {
        // Add financial record
        document.getElementById('add-financial-record').addEventListener('click', () => {
            this.openAddRecordModal();
        });
        
        // Set goals
        document.getElementById('set-financial-goals').addEventListener('click', () => {
            this.openGoalsModal();
        });
        
        // Export
        document.getElementById('export-finance-report').addEventListener('click', () => {
            this.exportFinancialReport();
        });
    },
    
    openAddRecordModal: function() {
        const modal = document.getElementById('add-record-modal');
        if (!modal) {
            this.createRecordModal();
        }
        document.getElementById('add-record-modal').classList.add('active');
    },
    
    createRecordModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'add-record-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Financial Record</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="financial-record-form">
                    <div class="form-group">
                        <label for="record-type">Record Type</label>
                        <select class="form-control" id="record-type" required>
                            <option value="">Select Type</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="record-amount">Amount ($)</label>
                        <input type="number" class="form-control" id="record-amount" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="record-category">Category</label>
                        <select class="form-control" id="record-category" required>
                            <option value="">Select Category</option>
                            <option value="wash-fold">Wash & Fold</option>
                            <option value="dry-cleaning">Dry Cleaning</option>
                            <option value="delivery">Delivery Service</option>
                            <option value="detergents">Detergents & Supplies</option>
                            <option value="utilities">Utilities</option>
                            <option value="staff">Staff Costs</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="record-date">Date</label>
                        <input type="date" class="form-control" id="record-date" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="record-description">Description</label>
                        <textarea class="form-control" id="record-description" rows="3" placeholder="Optional description"></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-secondary" style="width: 100%;">
                            <i class="fas fa-save"></i> Add Record
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Bind form submission
        document.getElementById('financial-record-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFinancialRecord();
        });
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    },
    
    addFinancialRecord: function() {
        const form = document.getElementById('financial-record-form');
        const formData = new FormData(form);
        
        const record = {
            id: utils.generateId(),
            type: document.getElementById('record-type').value,
            amount: parseFloat(document.getElementById('record-amount').value),
            category: document.getElementById('record-category').value,
            date: document.getElementById('record-date').value,
            description: document.getElementById('record-description').value,
            createdAt: new Date().toISOString()
        };
        
        const records = storage.get('financialRecords') || [];
        records.push(record);
        storage.set('financialRecords', records);
        
        // Update dashboard
        this.renderFinancialOverview();
        this.renderRecentTransactions();
        
        // Close modal and reset form
        document.getElementById('add-record-modal').classList.remove('active');
        form.reset();
        
        utils.showToast('Financial record added successfully!');
    },
    
    renderFinancialOverview: function() {
        const records = storage.get('financialRecords') || [];
        const goals = storage.get('financialGoals');
        
        // Calculate current month totals
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthRecords = records.filter(record => record.date.startsWith(currentMonth));
        
        const revenue = monthRecords.filter(r => r.type === 'revenue').reduce((sum, r) => sum + r.amount, 0);
        const expenses = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        // Update display
        document.getElementById('current-revenue').textContent = this.formatCurrency(revenue);
        document.getElementById('current-expenses').textContent = this.formatCurrency(expenses);
        document.getElementById('current-profit').textContent = this.formatCurrency(profit);
        document.getElementById('profit-margin').textContent = `${profitMargin.toFixed(1)}%`;
        
        // Update progress towards goals
        this.updateGoalProgress(revenue, expenses, profit, goals);
        
        // Update charts with real data
        this.updateChartsWithRealData();
    },
    
    updateGoalProgress: function(revenue, expenses, profit, goals) {
        const revenueProgress = (revenue / goals.monthlyRevenue) * 100;
        const expenseProgress = (expenses / goals.monthlyExpenses) * 100;
        const profitProgress = (profit / goals.monthlyProfit) * 100;
        
        this.updateProgressBar('revenue-progress', revenueProgress);
        this.updateProgressBar('expense-progress', expenseProgress);
        this.updateProgressBar('profit-progress', profitProgress);
        
        document.getElementById('revenue-progress-text').textContent = `${Math.round(revenueProgress)}%`;
        document.getElementById('expense-progress-text').textContent = `${Math.round(expenseProgress)}%`;
        document.getElementById('profit-progress-text').textContent = `${Math.round(profitProgress)}%`;
    },
    
    updateProgressBar: function(elementId, percentage) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            const width = Math.min(percentage, 100);
            progressBar.style.width = `${width}%`;
            progressBar.style.background = width >= 100 ? '#2ecc71' : '#3498db';
        }
    },
    
    updateChartsWithRealData: function() {
        const records = storage.get('financialRecords') || [];
        
        // Group by month for charts
        const monthlyData = this.groupRecordsByMonth(records);
        this.renderRevenueChart(monthlyData);
        this.renderExpenseChart(monthlyData);
    },
    
    groupRecordsByMonth: function(records) {
        const months = {};
        
        records.forEach(record => {
            const monthKey = record.date.slice(0, 7); // YYYY-MM
            if (!months[monthKey]) {
                months[monthKey] = { revenue: 0, expenses: 0 };
            }
            
            if (record.type === 'revenue') {
                months[monthKey].revenue += record.amount;
            } else {
                months[monthKey].expenses += record.amount;
            }
        });
        
        return months;
    },
    
    renderRevenueChart: function(monthlyData) {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        const goals = storage.get('financialGoals');
        
        const months = Object.keys(monthlyData).sort();
        const revenueData = months.map(month => monthlyData[month].revenue);
        const targetData = months.map(() => goals.monthlyRevenue);
        
        // Destroy existing chart if it exists
        if (this.revenueChart) {
            this.revenueChart.destroy();
        }
        
        this.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Actual Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }, {
                    label: 'Revenue Target',
                    data: targetData,
                    type: 'line',
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointBackgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Revenue vs Target'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },
    
    renderExpenseChart: function(monthlyData) {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        
        const months = Object.keys(monthlyData).sort();
        const expenseData = months.map(month => monthlyData[month].expenses);
        
        // Destroy existing chart if it exists
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }
        
        this.expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },
    
    openGoalsModal: function() {
        const goals = storage.get('financialGoals');
        
        const newRevenue = prompt('Monthly Revenue Target ($):', goals.monthlyRevenue);
        const newExpenses = prompt('Monthly Expense Budget ($):', goals.monthlyExpenses);
        const newProfit = prompt('Monthly Profit Goal ($):', goals.monthlyProfit);
        
        if (newRevenue && newExpenses && newProfit) {
            storage.set('financialGoals', {
                monthlyRevenue: parseInt(newRevenue),
                monthlyExpenses: parseInt(newExpenses),
                monthlyProfit: parseInt(newProfit)
            });
            
            this.renderFinancialOverview();
            utils.showToast('Financial goals updated successfully!');
        }
    },
    
    renderRecentTransactions: function() {
        const records = storage.get('financialRecords') || [];
        const recentRecords = records.slice(-10).reverse(); // Last 10 records
        
        const transactionsTable = document.getElementById('transactions-table');
        if (transactionsTable) {
            transactionsTable.innerHTML = '';
            
            recentRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.date}</td>
                    <td>
                        <span class="record-type ${record.type}">
                            ${record.type === 'revenue' ? '💰 Revenue' : '💸 Expense'}
                        </span>
                    </td>
                    <td>${this.formatCategory(record.category)}</td>
                    <td class="${record.type === 'revenue' ? 'positive' : 'negative'}">
                        ${record.type === 'revenue' ? '+' : '-'}${this.formatCurrency(record.amount)}
                    </td>
                    <td>${record.description || '-'}</td>
                `;
                transactionsTable.appendChild(row);
            });
        }
    },
    
    formatCategory: function(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },
    
    exportFinancialReport: function() {
        const records = storage.get('financialRecords') || [];
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Category,Amount,Description\n";
        
        records.forEach(record => {
            csvContent += `"${record.date}","${record.type}","${record.category}",${record.amount},"${record.description || ''}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_records_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        utils.showToast('Financial report exported successfully!');
    },
    
    formatCurrency: function(amount) {
        return '$' + parseFloat(amount).toFixed(2);
    }
};