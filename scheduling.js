// Professional Scheduling System - UPDATED VERSION
const scheduling = {
    currentDate: new Date(),
    editingAppointmentId: null,
    resources: ['Washer 1', 'Washer 2', 'Washer 3', 'Dryer 1', 'Dryer 2', 'Folding Station'],
    services: ['Wash & Fold', 'Dry Cleaning', 'Bulk Laundry', 'Express Service', 'Delivery'],
    
    init: function() {
        console.log('🔄 Initializing Scheduling System...');
        this.initializeSchedulingData();
        this.renderCalendar();
        this.renderAppointments();
        this.updateQuickStats();
        this.bindEvents();
        this.renderResourceStatus();
    },
    
    initializeSchedulingData: function() {
        if (!storage.get('appointments')) {
            console.log('📝 Initializing empty appointments...');
            storage.set('appointments', []);
        }
        
        if (!storage.get('serviceSettings')) {
            console.log('⚙️ Initializing service settings...');
            storage.set('serviceSettings', {
                businessHours: {
                    start: '08:00',
                    end: '20:00'
                },
                slotDuration: 60,
                bufferTime: 15
            });
        }
    },
    
    bindEvents: function() {
        console.log('🔗 Binding scheduling events...');
        
        // Add appointment button
        const addBtn = document.getElementById('scheduling-add-appointment-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                console.log('➕ Add appointment button clicked');
                this.openAppointmentModal();
            });
        }
        
        // Calendar navigation
        const prevMonth = document.getElementById('scheduling-prev-month');
        const nextMonth = document.getElementById('scheduling-next-month');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                console.log('⬅️ Previous month clicked');
                this.navigateMonth(-1);
            });
        }
        
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                console.log('➡️ Next month clicked');
                this.navigateMonth(1);
            });
        }
        
        // View switching
        const viewCalendar = document.getElementById('scheduling-view-calendar');
        const viewList = document.getElementById('scheduling-view-list');
        
        if (viewCalendar) {
            viewCalendar.addEventListener('click', () => {
                console.log('📅 Switching to calendar view');
                this.switchView('calendar');
            });
        }
        
        if (viewList) {
            viewList.addEventListener('click', () => {
                console.log('📋 Switching to list view');
                this.switchView('list');
            });
        }
        
        // Quick date navigation
        const goToday = document.getElementById('scheduling-go-today');
        if (goToday) {
            goToday.addEventListener('click', () => {
                console.log('📅 Go to today clicked');
                this.currentDate = new Date();
                this.renderCalendar();
                this.updateQuickStats();
            });
        }
        
        // Filter functionality
        const statusFilter = document.getElementById('scheduling-appointment-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                console.log('🔍 Filtering appointments by status:', e.target.value);
                this.filterAppointments(e.target.value);
            });
        }
    },
    
    openAppointmentModal: function(appointment = null) {
        console.log('🎯 Opening appointment modal', appointment ? 'for editing' : 'for new appointment');
        
        // Create modal if it doesn't exist
        if (!document.getElementById('appointment-modal')) {
            console.log('🆕 Creating appointment modal...');
            this.createAppointmentModal();
        }
        
        const modal = document.getElementById('appointment-modal');
        const modalTitle = document.getElementById('appointment-modal-title');
        const form = document.getElementById('appointment-form');
        
        if (appointment) {
            modalTitle.textContent = 'Edit Appointment';
            this.populateAppointmentForm(appointment);
            this.editingAppointmentId = appointment.id;
            console.log('✏️ Editing appointment ID:', appointment.id);
        } else {
            modalTitle.textContent = 'Add New Appointment';
            form.reset();
            this.setDefaultFormValues();
            this.editingAppointmentId = null;
            console.log('🆕 Creating new appointment');
        }
        
        modal.classList.add('active');
        console.log('✅ Modal opened successfully');
    },
    
    createAppointmentModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'appointment-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="appointment-modal-title">Add New Appointment</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="appointment-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="appointment-customer">Customer *</label>
                            <input type="text" class="form-control" id="appointment-customer" required 
                                   placeholder="Customer name">
                        </div>
                        <div class="form-group">
                            <label for="appointment-phone">Phone *</label>
                            <input type="tel" class="form-control" id="appointment-phone" required 
                                   placeholder="Phone number">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="appointment-service">Service *</label>
                            <select class="form-control" id="appointment-service" required>
                                <option value="">Select Service</option>
                                ${this.services.map(service => 
                                    `<option value="${service}">${service}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointment-resource">Machine/Station</label>
                            <select class="form-control" id="appointment-resource">
                                <option value="">Any Available</option>
                                ${this.resources.map(resource => 
                                    `<option value="${resource}">${resource}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="appointment-date">Date *</label>
                            <input type="date" class="form-control" id="appointment-date" required>
                        </div>
                        <div class="form-group">
                            <label for="appointment-time">Time *</label>
                            <select class="form-control" id="appointment-time" required>
                                <option value="">Select Time</option>
                                ${this.generateTimeSlots()}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointment-duration">Duration</label>
                        <select class="form-control" id="appointment-duration">
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                            <option value="180">3 hours</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointment-status">Status</label>
                        <select class="form-control" id="appointment-status">
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Recurring Appointment</label>
                        <div class="recurring-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="appointment-recurring"> Repeat this appointment
                            </label>
                            <div id="recurring-settings" style="display: none; margin-top: 10px;">
                                <select class="form-control" id="recurring-frequency">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <div style="margin-top: 5px;">
                                    <label for="recurring-end">Repeat until:</label>
                                    <input type="date" class="form-control" id="recurring-end">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointment-notes">Notes</label>
                        <textarea class="form-control" id="appointment-notes" rows="3" 
                                  placeholder="Special instructions or notes..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn" onclick="scheduling.closeAppointmentModal()">Cancel</button>
                        <button type="submit" class="btn btn-secondary">Save Appointment</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Bind form submission
        document.getElementById('appointment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📤 Form submitted - saving appointment');
            this.saveAppointment();
        });
        
        // Bind recurring toggle
        document.getElementById('appointment-recurring').addEventListener('change', (e) => {
            document.getElementById('recurring-settings').style.display = 
                e.target.checked ? 'block' : 'none';
        });
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeAppointmentModal();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAppointmentModal();
            }
        });
        
        console.log('✅ Appointment modal created successfully');
    },
    
    generateTimeSlots: function() {
        const settings = storage.get('serviceSettings');
        const start = settings.businessHours.start;
        const end = settings.businessHours.end;
        const slotDuration = settings.slotDuration;
        
        let slots = '';
        let currentTime = this.parseTime(start);
        const endTime = this.parseTime(end);
        
        while (currentTime < endTime) {
            const timeString = this.formatTime(currentTime);
            slots += `<option value="${timeString}">${timeString}</option>`;
            currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
        }
        
        console.log('⏰ Generated time slots:', slots.split('</option>').length - 1, 'slots');
        return slots;
    },
    
    parseTime: function(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    },
    
    formatTime: function(date) {
        return date.toTimeString().slice(0, 5);
    },
    
    setDefaultFormValues: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointment-date').value = today;
        document.getElementById('appointment-date').min = today;
        
        // Set default time to next available slot
        const now = new Date();
        const currentTime = this.formatTime(now);
        const timeSelect = document.getElementById('appointment-time');
        const options = Array.from(timeSelect.options);
        
        for (let option of options) {
            if (option.value > currentTime) {
                timeSelect.value = option.value;
                break;
            }
        }
        
        console.log('📅 Set default form values - date:', today, 'time:', timeSelect.value);
    },
    
    populateAppointmentForm: function(appointment) {
        console.log('📝 Populating form with appointment:', appointment.customer);
        
        document.getElementById('appointment-customer').value = appointment.customer;
        document.getElementById('appointment-phone').value = appointment.phone;
        document.getElementById('appointment-service').value = appointment.service;
        document.getElementById('appointment-resource').value = appointment.resource || '';
        document.getElementById('appointment-date').value = appointment.date;
        document.getElementById('appointment-time').value = appointment.time;
        document.getElementById('appointment-duration').value = appointment.duration || '60';
        document.getElementById('appointment-status').value = appointment.status || 'confirmed';
        document.getElementById('appointment-notes').value = appointment.notes || '';
        
        if (appointment.recurring) {
            document.getElementById('appointment-recurring').checked = true;
            document.getElementById('recurring-frequency').value = appointment.recurring.frequency;
            document.getElementById('recurring-end').value = appointment.recurring.endDate;
            document.getElementById('recurring-settings').style.display = 'block';
        }
        
        console.log('✅ Form populated successfully');
    },
    
    saveAppointment: function() {
        const form = document.getElementById('appointment-form');
        const isRecurring = document.getElementById('appointment-recurring').checked;
        
        const appointmentData = {
            customer: document.getElementById('appointment-customer').value,
            phone: document.getElementById('appointment-phone').value,
            service: document.getElementById('appointment-service').value,
            resource: document.getElementById('appointment-resource').value || null,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            duration: parseInt(document.getElementById('appointment-duration').value),
            status: document.getElementById('appointment-status').value,
            notes: document.getElementById('appointment-notes').value
        };
        
        if (isRecurring) {
            appointmentData.recurring = {
                frequency: document.getElementById('recurring-frequency').value,
                endDate: document.getElementById('recurring-end').value,
                originalDate: appointmentData.date
            };
        }
        
        const appointments = storage.get('appointments');
        
        if (this.editingAppointmentId) {
            // Update existing appointment
            const index = appointments.findIndex(a => a.id === this.editingAppointmentId);
            if (index !== -1) {
                appointments[index] = { 
                    ...appointments[index], 
                    ...appointmentData,
                    updatedAt: new Date().toISOString()
                };
                utils.showToast('Appointment updated successfully!');
                console.log('✅ Appointment updated:', this.editingAppointmentId);
            }
        } else {
            // Add new appointment(s)
            if (isRecurring) {
                const recurringAppointments = this.generateRecurringAppointments(appointmentData);
                appointments.push(...recurringAppointments);
                utils.showToast(`${recurringAppointments.length} recurring appointments created!`);
                console.log('✅ Created recurring appointments:', recurringAppointments.length);
            } else {
                const newAppointment = {
                    id: utils.generateId(),
                    ...appointmentData,
                    createdAt: new Date().toISOString()
                };
                appointments.push(newAppointment);
                utils.showToast('Appointment created successfully!');
                console.log('✅ Created new appointment:', newAppointment.id);
            }
        }
        
        storage.set('appointments', appointments);
        this.renderCalendar();
        this.renderAppointments();
        this.updateQuickStats();
        this.renderResourceStatus();
        this.closeAppointmentModal();
    },
    
    generateRecurringAppointments: function(baseAppointment) {
        console.log('🔄 Generating recurring appointments...');
        const appointments = [];
        const frequency = baseAppointment.recurring.frequency;
        const endDate = new Date(baseAppointment.recurring.endDate);
        let currentDate = new Date(baseAppointment.date);
        
        let count = 0;
        const maxAppointments = 50; // Safety limit
        
        while (currentDate <= endDate && count < maxAppointments) {
            const appointment = {
                id: utils.generateId(),
                ...baseAppointment,
                date: currentDate.toISOString().split('T')[0],
                recurring: {
                    ...baseAppointment.recurring,
                    instance: count + 1
                },
                createdAt: new Date().toISOString()
            };
            
            appointments.push(appointment);
            count++;
            
            // Move to next date based on frequency
            if (frequency === 'daily') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (frequency === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (frequency === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        
        console.log('✅ Generated', appointments.length, 'recurring appointments');
        return appointments;
    },
    
    closeAppointmentModal: function() {
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingAppointmentId = null;
        console.log('🚪 Appointment modal closed');
    },
    
    renderCalendar: function() {
        console.log('📅 Rendering calendar...');
        const calendarGrid = document.getElementById('scheduling-calendar-grid');
        const currentMonthElement = document.getElementById('scheduling-current-month');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month header
        currentMonthElement.textContent = this.currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day header';
            dayDiv.textContent = day;
            calendarGrid.appendChild(dayDiv);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDiv);
        }
        
        // Add days of the month
        const appointments = storage.get('appointments') || [];
        const today = new Date().toISOString().split('T')[0];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            dayDiv.dataset.date = dateString;
            
            // Check if today
            if (dateString === today) {
                dayDiv.classList.add('today');
            }
            
            // Check for appointments
            const dayAppointments = appointments.filter(apt => apt.date === dateString);
            if (dayAppointments.length > 0) {
                dayDiv.classList.add('has-appointments');
                
                const appointmentCount = document.createElement('div');
                appointmentCount.className = 'appointment-count';
                appointmentCount.textContent = dayAppointments.length;
                dayDiv.appendChild(appointmentCount);
                
                // Add click handler to show day details
                dayDiv.addEventListener('click', () => {
                    this.showDayDetails(dateString, dayAppointments);
                });
            } else {
                dayDiv.addEventListener('click', () => {
                    this.showEmptyDay(dateString);
                });
            }
            
            calendarGrid.appendChild(dayDiv);
        }
        
        console.log('✅ Calendar rendered with', daysInMonth, 'days');
    },
    
    showDayDetails: function(dateString, appointments) {
        console.log('📖 Showing day details for:', dateString, 'with', appointments.length, 'appointments');
        
        // Create or show day details panel
        let detailsPanel = document.getElementById('day-details-panel');
        if (!detailsPanel) {
            detailsPanel = document.createElement('div');
            detailsPanel.id = 'day-details-panel';
            detailsPanel.className = 'day-details-panel';
            document.querySelector('#scheduling').appendChild(detailsPanel);
        }
        
        detailsPanel.innerHTML = `
            <div class="day-details-header">
                <h3>Appointments for ${this.formatDisplayDate(dateString)}</h3>
                <button class="btn btn-secondary" onclick="scheduling.openAppointmentModal()">
                    <i class="fas fa-plus"></i> Add Appointment
                </button>
                <button class="btn" onclick="scheduling.closeDayDetails()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="day-appointments-list">
                ${appointments.map(apt => `
                    <div class="appointment-item ${apt.status}" data-appointment-id="${apt.id}">
                        <div class="appointment-time">${apt.time}</div>
                        <div class="appointment-details">
                            <div class="appointment-customer">${apt.customer}</div>
                            <div class="appointment-service">${apt.service} • ${apt.resource || 'Any'}</div>
                            <div class="appointment-notes">${apt.notes || 'No notes'}</div>
                        </div>
                        <div class="appointment-actions">
                            <span class="status-badge status-${apt.status}">${apt.status}</span>
                            <div class="action-buttons">
                                <button class="btn-small" onclick="scheduling.editAppointment('${apt.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-small" onclick="scheduling.toggleAppointmentStatus('${apt.id}')" title="Toggle Status">
                                    <i class="fas fa-sync"></i>
                                </button>
                                <button class="btn-small btn-danger" onclick="scheduling.deleteAppointment('${apt.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="day-details-actions">
                <button class="btn" onclick="scheduling.switchToListView('${dateString}')">
                    <i class="fas fa-list"></i> View in List
                </button>
                <button class="btn btn-secondary" onclick="scheduling.openAppointmentModal()">
                    <i class="fas fa-plus"></i> Add New
                </button>
            </div>
        `;
        
        detailsPanel.classList.add('active');
        console.log('✅ Day details panel shown');
    },
    
    showEmptyDay: function(dateString) {
        console.log('📅 Empty day clicked:', dateString);
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            document.getElementById('appointment-date').value = dateString;
            this.openAppointmentModal();
        } else {
            utils.showToast(`No appointments on ${this.formatDisplayDate(dateString)}. Click "New Appointment" to schedule one.`);
        }
    },
    
    closeDayDetails: function() {
        const detailsPanel = document.getElementById('day-details-panel');
        if (detailsPanel) {
            detailsPanel.classList.remove('active');
        }
        console.log('🚪 Day details closed');
    },
    
    switchToListView: function(dateString = null) {
        console.log('📋 Switching to list view', dateString ? 'for date:' + dateString : '');
        this.switchView('list');
        if (dateString) {
            // Set filter to show only this date
            const filter = document.getElementById('scheduling-appointment-status-filter');
            if (filter) {
                filter.value = 'all';
            }
            utils.showToast(`Switched to list view. Use search/filter to find appointments for ${dateString}`);
        }
    },
    
    formatDisplayDate: function(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    navigateMonth: function(direction) {
        console.log('🗓️ Navigating month:', direction > 0 ? 'next' : 'previous');
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
        this.closeDayDetails();
    },
    
    renderAppointments: function(filterStatus = 'all') {
        console.log('📋 Rendering appointments list, filter:', filterStatus);
        const appointments = storage.get('appointments') || [];
        const appointmentsTable = document.getElementById('scheduling-appointments-table');
        
        // Filter appointments if needed
        let filteredAppointments = appointments;
        if (filterStatus !== 'all') {
            filteredAppointments = appointments.filter(apt => apt.status === filterStatus.toLowerCase());
        }
        
        // Sort appointments by date and time
        const sortedAppointments = filteredAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        appointmentsTable.innerHTML = '';
        
        if (sortedAppointments.length === 0) {
            appointmentsTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--gray); padding: 40px;">
                        <i class="fas fa-calendar-plus" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        ${filterStatus === 'all' ? 'No appointments scheduled.' : `No ${filterStatus.toLowerCase()} appointments.`} <br>
                        <button class="btn btn-secondary" onclick="scheduling.openAppointmentModal()" style="margin-top: 10px;">
                            Schedule Your First Appointment
                        </button>
                    </td>
                </tr>
            `;
            console.log('📭 No appointments to display');
            return;
        }
        
        sortedAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${this.formatDisplayDate(appointment.date)}</strong><br>
                    <small>${appointment.time}</small>
                </td>
                <td>
                    <div>${appointment.customer}</div>
                    <small>${appointment.phone}</small>
                </td>
                <td>${appointment.service}</td>
                <td>${appointment.resource || 'Any Available'}</td>
                <td>
                    <span class="status status-${appointment.status}">
                        ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    ${appointment.recurring ? '<br><small class="recurring-badge">Recurring</small>' : ''}
                </td>
                <td class="action-cell">
                    <i class="fas fa-edit action-icon action-edit" 
                       title="Edit" 
                       onclick="scheduling.editAppointment('${appointment.id}')"></i>
                    <i class="fas fa-sync action-icon action-sync" 
                       title="Change Status" 
                       onclick="scheduling.toggleAppointmentStatus('${appointment.id}')"></i>
                    <i class="fas fa-trash action-icon action-delete" 
                       title="Delete" 
                       onclick="scheduling.deleteAppointment('${appointment.id}')"></i>
                </td>
            `;
            appointmentsTable.appendChild(row);
        });
        
        console.log('✅ Appointments list rendered with', sortedAppointments.length, 'appointments');
    },
    
    toggleAppointmentStatus: function(appointmentId) {
        console.log('🔄 Toggling appointment status:', appointmentId);
        const appointments = storage.get('appointments') || [];
        const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
        
        if (appointmentIndex !== -1) {
            const currentStatus = appointments[appointmentIndex].status;
            const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled'];
            const currentIndex = statusOrder.indexOf(currentStatus);
            const nextIndex = (currentIndex + 1) % statusOrder.length;
            
            appointments[appointmentIndex].status = statusOrder[nextIndex];
            storage.set('appointments', appointments);
            
            this.renderAppointments();
            this.renderCalendar();
            this.updateQuickStats();
            this.renderResourceStatus();
            
            utils.showToast(`Appointment status changed to ${statusOrder[nextIndex]}`);
            console.log('✅ Appointment status changed to:', statusOrder[nextIndex]);
        }
    },
    
    filterAppointments: function(status) {
        console.log('🔍 Filtering appointments by status:', status);
        this.renderAppointments(status);
    },
    
    editAppointment: function(appointmentId) {
        console.log('✏️ Editing appointment:', appointmentId);
        const appointments = storage.get('appointments') || [];
        const appointment = appointments.find(a => a.id === appointmentId);
        
        if (appointment) {
            this.openAppointmentModal(appointment);
        } else {
            console.error('❌ Appointment not found:', appointmentId);
        }
    },
    
    completeAppointment: function(appointmentId) {
        console.log('✅ Completing appointment:', appointmentId);
        const appointments = storage.get('appointments') || [];
        const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'completed';
            storage.set('appointments', appointments);
            this.renderAppointments();
            this.renderCalendar();
            this.updateQuickStats();
            utils.showToast('Appointment marked as complete!');
        }
    },
    
    deleteAppointment: function(appointmentId) {
        console.log('🗑️ Deleting appointment:', appointmentId);
        if (confirm('Are you sure you want to delete this appointment?')) {
            const appointments = storage.get('appointments') || [];
            const updatedAppointments = appointments.filter(a => a.id !== appointmentId);
            storage.set('appointments', updatedAppointments);
            this.renderCalendar();
            this.renderAppointments();
            this.updateQuickStats();
            this.closeDayDetails();
            utils.showToast('Appointment deleted successfully!');
            console.log('✅ Appointment deleted successfully');
        }
    },
    
    switchView: function(view) {
        console.log('🔄 Switching scheduling view to:', view);
        
        const calendarView = document.getElementById('scheduling-calendar-view');
        const listView = document.getElementById('scheduling-list-view');
        const calendarBtn = document.getElementById('scheduling-view-calendar');
        const listBtn = document.getElementById('scheduling-view-list');
        
        if (calendarView) calendarView.style.display = view === 'calendar' ? 'block' : 'none';
        if (listView) listView.style.display = view === 'list' ? 'block' : 'none';
        
        if (calendarBtn) calendarBtn.classList.toggle('active', view === 'calendar');
        if (listBtn) listBtn.classList.toggle('active', view === 'list');
        
        if (view === 'list') {
            this.renderAppointments();
        } else {
            this.closeDayDetails();
        }
        
        console.log('✅ View switched to:', view);
    },
    
    updateQuickStats: function() {
        console.log('📊 Updating scheduling stats...');
        const appointments = storage.get('appointments') || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Today's appointments
        const todayAppointments = appointments.filter(apt => apt.date === today);
        document.getElementById('scheduling-today-appointments').textContent = todayAppointments.length;
        
        // This week's appointments
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
        });
        document.getElementById('scheduling-week-appointments').textContent = weekAppointments.length;
        
        // Pending appointments
        const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
        document.getElementById('scheduling-pending-appointments').textContent = pendingAppointments.length;
        
        // Recurring appointments
        const recurringAppointments = appointments.filter(apt => apt.recurring);
        document.getElementById('scheduling-recurring-appointments').textContent = recurringAppointments.length;
        
        console.log('📈 Stats updated - Today:', todayAppointments.length, 'Week:', weekAppointments.length, 'Pending:', pendingAppointments.length, 'Recurring:', recurringAppointments.length);
    },
    
    renderResourceStatus: function() {
        console.log('🔧 Rendering resource status...');
        const resourcesGrid = document.getElementById('scheduling-resources-grid');
        if (resourcesGrid) {
            const appointments = storage.get('appointments') || [];
            const today = new Date().toISOString().split('T')[0];
            const now = new Date();
            
            resourcesGrid.innerHTML = this.resources.map(resource => {
                // Check if resource is in use
                const resourceInUse = appointments.some(apt => {
                    if (apt.resource !== resource || apt.date !== today || apt.status === 'completed' || apt.status === 'cancelled') {
                        return false;
                    }
                    
                    const aptTime = new Date(`${today}T${apt.time}`);
                    const aptEnd = new Date(aptTime.getTime() + (apt.duration || 60) * 60000);
                    return now >= aptTime && now <= aptEnd;
                });
                
                const status = resourceInUse ? 'in-use' : 'available';
                const statusText = resourceInUse ? 'In Use' : 'Available';
                
                return `
                    <div class="resource-card ${status}">
                        <h4>${resource}</h4>
                        <div class="resource-status">${statusText}</div>
                        <div class="resource-next-booking">
                            ${resourceInUse ? 'Currently occupied' : 'Ready for use'}
                        </div>
                    </div>
                `;
            }).join('');
            
            console.log('✅ Resource status rendered for', this.resources.length, 'resources');
        }
    }
};