// Professional Marketing Content Manager - COMPLETE REWRITE
const marketing = {
    platforms: ['WhatsApp', 'Facebook', 'Google My Business', 'Instagram', 'TikTok', 'Twitter', 'Email Newsletter'],
    contentStatus: ['draft', 'scheduled', 'published', 'archived'],
    editingContentId: null,
    currentView: 'list',
    
    init: function() {
        console.log('🔄 Initializing Marketing Manager...');
        this.debugStorage('BEFORE INIT');
        this.initializeMarketingData();
        this.bindEvents();
        this.updateStats();
        this.switchView('list'); // Start with list view
        
        // Debug after init
        setTimeout(() => {
            this.debugStorage('AFTER INIT');
            this.testDataCreation();
        }, 1000);
    },
    
    initializeMarketingData: function() {
        let contents = storage.get('marketingContent');
        console.log('📝 Initial marketing data:', contents);
        
        if (!contents || !Array.isArray(contents)) {
            console.log('🆕 Initializing empty marketing content array');
            storage.set('marketingContent', []);
        } else {
            console.log('✅ Found existing marketing content:', contents.length, 'items');
        }
    },
    
    bindEvents: function() {
        console.log('🔗 Binding marketing events...');
        
        // Add content button
        const addBtn = document.getElementById('add-content-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                console.log('➕ Add content button clicked');
                this.openContentModal();
            });
        } else {
            console.error('❌ Add content button not found');
        }
        
        // View switching
        const viewCalendar = document.getElementById('marketing-view-calendar');
        const viewList = document.getElementById('marketing-view-list');
        
        if (viewCalendar) {
            viewCalendar.addEventListener('click', () => {
                console.log('📅 Switching to calendar view');
                this.switchView('calendar');
            });
        } else {
            console.error('❌ Calendar view button not found');
        }
        
        if (viewList) {
            viewList.addEventListener('click', () => {
                console.log('📋 Switching to list view');
                this.switchView('list');
            });
        } else {
            console.error('❌ List view button not found');
        }
        
        // Platform filter
        const platformFilter = document.getElementById('platform-filter');
        if (platformFilter) {
            platformFilter.addEventListener('change', (e) => {
                console.log('🔍 Filtering by platform:', e.target.value);
                this.filterByPlatform(e.target.value);
            });
        } else {
            console.error('❌ Platform filter not found');
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                console.log('🔍 Filtering by status:', e.target.value);
                this.filterByStatus(e.target.value);
            });
        } else {
            console.error('❌ Status filter not found');
        }
        
        // Quick template buttons
        const templateBtns = document.querySelectorAll('.template-btn');
        if (templateBtns.length > 0) {
            templateBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const templateId = e.target.dataset.template || e.target.closest('.template-btn').dataset.template;
                    console.log('📋 Using template:', templateId);
                    this.useTemplate(templateId);
                });
            });
        } else {
            console.log('ℹ️ No template buttons found');
        }
        
        console.log('✅ All events bound successfully');
    },
    
    openContentModal: function(content = null) {
        console.log('🎯 Opening content modal', content ? 'for editing' : 'for new content');
        
        // Create modal if it doesn't exist
        if (!document.getElementById('content-modal')) {
            console.log('🆕 Creating content modal...');
            this.createContentModal();
        }
        
        const modal = document.getElementById('content-modal');
        const modalTitle = document.getElementById('content-modal-title');
        const form = document.getElementById('content-form');
        
        if (!modal || !modalTitle || !form) {
            console.error('❌ Modal elements not found');
            return;
        }
        
        if (content) {
            modalTitle.textContent = 'Edit Content';
            this.populateContentForm(content);
            this.editingContentId = content.id;
            console.log('✏️ Editing content ID:', content.id);
        } else {
            modalTitle.textContent = 'Create Marketing Content';
            form.reset();
            this.setDefaultFormValues();
            this.editingContentId = null;
            console.log('🆕 Creating new content');
        }
        
        modal.classList.add('active');
        console.log('✅ Modal opened successfully');
    },
    
    createContentModal: function() {
        console.log('🏗️ Building content modal...');
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'content-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3 id="content-modal-title">Create Marketing Content</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="content-form">
                    <div class="form-group">
                        <label for="content-title">Content Title *</label>
                        <input type="text" class="form-control" id="content-title" required 
                               placeholder="e.g., Summer Promotion, Service Update...">
                    </div>
                    
                    <div class="form-group">
                        <label for="content-platforms">Platforms *</label>
                        <div class="platform-selector" id="platform-selector">
                            ${this.platforms.map(platform => `
                                <label class="platform-checkbox">
                                    <input type="checkbox" name="platforms" value="${platform}">
                                    <span class="platform-label">${platform}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="content-type">Content Type</label>
                            <select class="form-control" id="content-type">
                                <option value="post">Social Media Post</option>
                                <option value="ad">Advertisement</option>
                                <option value="announcement">Announcement</option>
                                <option value="promotion">Promotion</option>
                                <option value="reminder">Service Reminder</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="content-status">Status</label>
                            <select class="form-control" id="content-status">
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="publish-date">Publish Date</label>
                            <input type="date" class="form-control" id="publish-date">
                        </div>
                        <div class="form-group">
                            <label for="publish-time">Publish Time</label>
                            <input type="time" class="form-control" id="publish-time">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="content-text">Content Text *</label>
                        <textarea class="form-control" id="content-text" rows="6" required 
                                  placeholder="Write your marketing content here... Use emojis and compelling copy!"></textarea>
                        <div class="character-count">
                            <span id="char-count">0</span> characters
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="content-tags">Tags</label>
                        <input type="text" class="form-control" id="content-tags" 
                               placeholder="Add tags separated by commas (e.g., promotion, summer, discount)">
                    </div>
                    
                    <div class="form-group">
                        <label for="content-notes">Internal Notes</label>
                        <textarea class="form-control" id="content-notes" rows="3" 
                                  placeholder="Any internal notes or instructions..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn" onclick="marketing.closeContentModal()">Cancel</button>
                        <button type="button" class="btn" onclick="marketing.saveAsDraft()">Save as Draft</button>
                        <button type="submit" class="btn btn-secondary">Schedule Content</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ Modal HTML added to DOM');
        
        // Bind form submission
        const formElement = document.getElementById('content-form');
        if (formElement) {
            formElement.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📤 Form submitted - saving content');
                this.saveContent();
            });
        }
        
        // Character count
        const contentText = document.getElementById('content-text');
        if (contentText) {
            contentText.addEventListener('input', (e) => {
                const charCount = document.getElementById('char-count');
                if (charCount) {
                    charCount.textContent = e.target.value.length;
                }
            });
        }
        
        // Close modal
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeContentModal();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeContentModal();
            }
        });
        
        console.log('✅ Content modal created successfully');
    },
    
    setDefaultFormValues: function() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateField = document.getElementById('publish-date');
        const timeField = document.getElementById('publish-time');
        
        if (dateField) dateField.value = tomorrow.toISOString().split('T')[0];
        if (timeField) timeField.value = '09:00';
        
        console.log('📅 Set default publish date to tomorrow');
    },
    
    populateContentForm: function(content) {
        console.log('📝 Populating form with content:', content);
        
        // Set basic fields
        const fields = {
            'content-title': content.title,
            'content-type': content.type,
            'content-status': content.status,
            'content-text': content.text,
            'content-tags': content.tags ? content.tags.join(', ') : '',
            'content-notes': content.notes || '',
            'publish-date': content.publishDate || '',
            'publish-time': content.publishTime || '09:00'
        };
        
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = fields[fieldId];
            }
        });
        
        // Set platforms
        const platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
        platformCheckboxes.forEach(checkbox => {
            checkbox.checked = content.platforms && content.platforms.includes(checkbox.value);
        });
        
        // Update character count
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = content.text ? content.text.length : 0;
        }
        
        console.log('✅ Form populated successfully');
    },
    
    useTemplate: function(templateId) {
        console.log('📋 Using template:', templateId);
        
        const templates = {
            template1: {
                title: "Weekly Promotion",
                text: "🚀 FreshWash Pro Special! \n\nThis week only: 20% off all dry cleaning services! \n\n✨ Professional cleaning\n✨ Eco-friendly detergents\n✨ Quick turnaround\n\nBook now! 📞 0904 393 0196",
                type: "promotion"
            },
            template2: {
                title: "Service Reminder", 
                text: "👕 Don't forget about your laundry! \n\nWe're here to make your life easier with:\n• Wash & Fold service\n• Dry cleaning\n• Express delivery\n\nSchedule your pickup today! 📞 0904 393 0196",
                type: "reminder"
            }
        };
        
        const template = templates[templateId];
        if (template) {
            this.openContentModal();
            setTimeout(() => {
                document.getElementById('content-title').value = template.title;
                document.getElementById('content-text').value = template.text;
                document.getElementById('content-type').value = template.type;
                document.getElementById('char-count').textContent = template.text.length;
                
                // Auto-select common platforms
                const platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
                platformCheckboxes.forEach(checkbox => {
                    checkbox.checked = ['WhatsApp', 'Facebook'].includes(checkbox.value);
                });
                
                console.log('✅ Template applied successfully');
            }, 100);
        }
    },
    
    saveContent: function() {
        console.log('💾 Saving as scheduled content...');
        const formData = this.getFormData();
        formData.status = 'scheduled';
        this.saveContentData(formData, 'Content scheduled successfully!');
    },
    
    saveAsDraft: function() {
        console.log('💾 Saving as draft...');
        const formData = this.getFormData();
        formData.status = 'draft';
        this.saveContentData(formData, 'Content saved as draft!');
    },
    
    getFormData: function() {
        const platformCheckboxes = document.querySelectorAll('input[name="platforms"]:checked');
        const platforms = Array.from(platformCheckboxes).map(cb => cb.value);
        
        console.log('📦 Selected platforms:', platforms);
        
        if (platforms.length === 0) {
            utils.showToast('Please select at least one platform');
            throw new Error('No platforms selected');
        }
        
        const formData = {
            title: document.getElementById('content-title').value,
            platforms: platforms,
            type: document.getElementById('content-type').value,
            status: document.getElementById('content-status').value,
            text: document.getElementById('content-text').value,
            tags: document.getElementById('content-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            notes: document.getElementById('content-notes').value,
            publishDate: document.getElementById('publish-date').value,
            publishTime: document.getElementById('publish-time').value
        };
        
        console.log('📦 Form data collected:', formData);
        return formData;
    },
    
    saveContentData: function(contentData, successMessage) {
        try {
            console.log('💾 Starting content save process...');
            
            let contents = storage.get('marketingContent') || [];
            console.log('📚 Current contents before save:', contents.length);
            
            if (this.editingContentId) {
                // Update existing content
                console.log('✏️ Updating existing content:', this.editingContentId);
                const index = contents.findIndex(c => c.id === this.editingContentId);
                if (index !== -1) {
                    contents[index] = {
                        ...contents[index],
                        ...contentData,
                        updatedAt: new Date().toISOString()
                    };
                    console.log('✅ Content updated at index:', index);
                } else {
                    console.error('❌ Content not found for editing:', this.editingContentId);
                    utils.showToast('Error: Content not found');
                    return;
                }
            } else {
                // Add new content
                console.log('🆕 Adding new content');
                const newContent = {
                    id: utils.generateId(),
                    ...contentData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                contents.push(newContent);
                console.log('✅ New content created with ID:', newContent.id);
            }
            
            // Save to storage
            console.log('💿 Saving to storage...');
            storage.set('marketingContent', contents);
            
            // Verify save worked
            const verifyContents = storage.get('marketingContent');
            console.log('🔍 Verifying save - contents in storage:', verifyContents.length);
            
            // Update UI
            console.log('🎨 Updating UI...');
            this.refreshAllViews();
            this.closeContentModal();
            
            utils.showToast(successMessage);
            console.log('✅ Content save process completed successfully');
            
        } catch (error) {
            console.error('❌ Error saving content:', error);
            utils.showToast('Error saving content: ' + error.message);
        }
    },
    
    refreshAllViews: function() {
        this.updateStats();
        if (this.currentView === 'list') {
            this.renderContentList();
        } else {
            this.renderContentCalendar();
        }
    },
    
    closeContentModal: function() {
        const modal = document.getElementById('content-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingContentId = null;
        console.log('🚪 Content modal closed');
    },
    
    renderContentList: function(filterPlatform = 'all', filterStatus = 'all') {
        console.log('📋 Rendering content list...');
        
        const contentList = document.getElementById('content-list');
        if (!contentList) {
            console.error('❌ Content list element not found');
            return;
        }
        
        const contents = storage.get('marketingContent') || [];
        console.log('📚 Contents to render:', contents);
        
        let filteredContents = contents;
        
        // Apply filters
        if (filterPlatform !== 'all') {
            filteredContents = filteredContents.filter(content => 
                content.platforms && content.platforms.includes(filterPlatform)
            );
        }
        
        if (filterStatus !== 'all') {
            filteredContents = filteredContents.filter(content => 
                content.status === filterStatus
            );
        }
        
        console.log('🔍 Filtered contents:', filteredContents.length);
        
        // Sort by publish date (scheduled first, then drafts)
        filteredContents.sort((a, b) => {
            if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
            if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
            return new Date(a.publishDate || '9999-12-31') - new Date(b.publishDate || '9999-12-31');
        });
        
        contentList.innerHTML = '';
        
        if (filteredContents.length === 0) {
            contentList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <h3>No Marketing Content</h3>
                    <p>Create your first piece of content to get started</p>
                    <button class="btn btn-secondary" onclick="marketing.openContentModal()">
                        <i class="fas fa-plus"></i> Create Content
                    </button>
                </div>
            `;
            console.log('📭 No content to display - showing empty state');
            return;
        }
        
        console.log('🎨 Rendering', filteredContents.length, 'content items');
        
        filteredContents.forEach((content, index) => {
            const contentItem = document.createElement('div');
            contentItem.className = `content-item ${content.status}`;
            contentItem.innerHTML = `
                <div class="content-header">
                    <h4>${content.title || 'Untitled'}</h4>
                    <span class="content-type">${content.type || 'post'}</span>
                </div>
                
                <div class="content-platforms">
                    ${(content.platforms || []).map(platform => `
                        <span class="platform-tag platform-${platform.toLowerCase().replace(/ /g, '-')}">
                            ${platform}
                        </span>
                    `).join('')}
                </div>
                
                <div class="content-preview">
                    <p>${(content.text || '').substring(0, 150)}${content.text && content.text.length > 150 ? '...' : ''}</p>
                </div>
                
                <div class="content-meta">
                    <div class="content-status">
                        <span class="status-badge status-${content.status || 'draft'}">
                            ${content.status || 'draft'}
                        </span>
                    </div>
                    
                    <div class="content-dates">
                        ${content.publishDate ? `
                            <div class="publish-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDisplayDate(content.publishDate)} at ${content.publishTime || '09:00'}
                            </div>
                        ` : ''}
                        <div class="created-date">
                            Created: ${this.formatRelativeDate(content.createdAt)}
                        </div>
                    </div>
                </div>
                
                <div class="content-actions">
                    <button class="btn-small" onclick="marketing.editContent('${content.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small" onclick="marketing.previewContent('${content.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    ${content.status === 'scheduled' ? `
                        <button class="btn-small btn-success" onclick="marketing.publishNow('${content.id}')">
                            <i class="fas fa-paper-plane"></i> Publish Now
                        </button>
                    ` : ''}
                    <button class="btn-small btn-danger" onclick="marketing.deleteContent('${content.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            contentList.appendChild(contentItem);
        });
        
        console.log('✅ Content list rendered successfully');
    },
    
    renderContentCalendar: function() {
        console.log('📅 Rendering content calendar...');
        const calendarEl = document.getElementById('content-calendar');
        if (!calendarEl) {
            console.error('❌ Content calendar element not found');
            return;
        }
        
        const contents = storage.get('marketingContent') || [];
        console.log('📚 Contents for calendar:', contents);
        
        const scheduledContents = contents.filter(content => 
            content.status === 'scheduled' && content.publishDate
        );
        
        if (scheduledContents.length === 0) {
            calendarEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No Scheduled Content</h3>
                    <p>Schedule content to see it on the calendar</p>
                    <button class="btn btn-secondary" onclick="marketing.openContentModal()">
                        <i class="fas fa-plus"></i> Create Content
                    </button>
                </div>
            `;
            return;
        }
        
        calendarEl.innerHTML = `
            <div class="calendar-month">
                <h4>Upcoming Scheduled Content</h4>
                <div class="calendar-content">
                    ${scheduledContents.map(content => `
                        <div class="calendar-item">
                            <div class="calendar-date">${this.formatDisplayDate(content.publishDate)}</div>
                            <div class="calendar-content-title">${content.title || 'Untitled'}</div>
                            <div class="calendar-platforms">
                                ${(content.platforms || []).map(platform => `
                                    <span class="platform-tag small">${platform}</span>
                                `).join('')}
                            </div>
                            <div class="calendar-time">${content.publishTime || '09:00'}</div>
                            <div class="calendar-actions">
                                <button class="btn-small" onclick="marketing.editContent('${content.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        console.log('✅ Content calendar rendered successfully');
    },
    
    editContent: function(contentId) {
        console.log('✏️ Editing content:', contentId);
        const contents = storage.get('marketingContent') || [];
        const content = contents.find(c => c.id === contentId);
        
        if (content) {
            this.openContentModal(content);
        } else {
            console.error('❌ Content not found for editing:', contentId);
            utils.showToast('Content not found');
        }
    },
    
    previewContent: function(contentId) {
        console.log('👀 Previewing content:', contentId);
        const contents = storage.get('marketingContent') || [];
        const content = contents.find(c => c.id === contentId);
        
        if (content) {
            const platforms = (content.platforms || []).join(', ');
            const previewText = `
Title: ${content.title || 'Untitled'}
Platforms: ${platforms}
Type: ${content.type || 'post'}
Status: ${content.status || 'draft'}
${content.publishDate ? `Scheduled: ${content.publishDate} at ${content.publishTime || '09:00'}` : ''}

Content:
${content.text || 'No content'}

${content.tags && content.tags.length > 0 ? `Tags: ${content.tags.join(', ')}` : ''}
${content.notes ? `Notes: ${content.notes}` : ''}
            `;
            
            alert(previewText);
        }
    },
    
    publishNow: function(contentId) {
        console.log('🚀 Publishing content now:', contentId);
        if (confirm('Publish this content now?')) {
            const contents = storage.get('marketingContent') || [];
            const contentIndex = contents.findIndex(c => c.id === contentId);
            
            if (contentIndex !== -1) {
                contents[contentIndex].status = 'published';
                contents[contentIndex].publishedAt = new Date().toISOString();
                storage.set('marketingContent', contents);
                
                this.refreshAllViews();
                utils.showToast('Content published!');
                console.log('✅ Content published successfully');
            }
        }
    },
    
    deleteContent: function(contentId) {
        console.log('🗑️ Deleting content:', contentId);
        if (confirm('Are you sure you want to delete this content?')) {
            const contents = storage.get('marketingContent') || [];
            const updatedContents = contents.filter(c => c.id !== contentId);
            storage.set('marketingContent', updatedContents);
            
            this.refreshAllViews();
            utils.showToast('Content deleted successfully!');
            console.log('✅ Content deleted successfully');
        }
    },
    
    filterByPlatform: function(platform) {
        console.log('🔍 Filtering by platform:', platform);
        const statusFilter = document.getElementById('status-filter');
        this.renderContentList(platform, statusFilter ? statusFilter.value : 'all');
    },
    
    filterByStatus: function(status) {
        console.log('🔍 Filtering by status:', status);
        const platformFilter = document.getElementById('platform-filter');
        this.renderContentList(platformFilter ? platformFilter.value : 'all', status);
    },
    
    switchView: function(view) {
        console.log('🔄 Switching to view:', view);
        this.currentView = view;
        
        const calendarView = document.getElementById('marketing-calendar-view');
        const listView = document.getElementById('marketing-list-view');
        const calendarBtn = document.getElementById('marketing-view-calendar');
        const listBtn = document.getElementById('marketing-view-list');
        
        if (calendarView) calendarView.style.display = view === 'calendar' ? 'block' : 'none';
        if (listView) listView.style.display = view === 'list' ? 'block' : 'none';
        
        if (calendarBtn) calendarBtn.classList.toggle('active', view === 'calendar');
        if (listBtn) listBtn.classList.toggle('active', view === 'list');
        
        if (view === 'list') {
            this.renderContentList();
        } else if (view === 'calendar') {
            this.renderContentCalendar();
        }
        
        console.log('✅ View switched to:', view);
    },
    
    updateStats: function() {
        console.log('📊 Updating stats...');
        const contents = storage.get('marketingContent') || [];
        
        const drafts = contents.filter(c => c.status === 'draft').length;
        const scheduled = contents.filter(c => c.status === 'scheduled').length;
        const published = contents.filter(c => c.status === 'published').length;
        const total = contents.length;
        
        console.log('📈 Stats - Total:', total, 'Drafts:', drafts, 'Scheduled:', scheduled, 'Published:', published);
        
        // Update DOM elements
        const totalEl = document.getElementById('total-content');
        const draftEl = document.getElementById('draft-content');
        const scheduledEl = document.getElementById('scheduled-content');
        const publishedEl = document.getElementById('published-content');
        
        if (totalEl) totalEl.textContent = total;
        if (draftEl) draftEl.textContent = drafts;
        if (scheduledEl) scheduledEl.textContent = scheduled;
        if (publishedEl) publishedEl.textContent = published;
        
        console.log('✅ Stats updated successfully');
    },
    
    debugStorage: function(phase = 'DEBUG') {
        console.log(`🔍 ${phase} - Marketing Storage Check:`);
        const contents = storage.get('marketingContent') || [];
        console.log(`📦 Contents in storage:`, contents);
        console.log(`📊 Total items: ${contents.length}`);
        
        contents.forEach((content, index) => {
            console.log(`   ${index + 1}. ${content.title} (${content.status}) - ${content.platforms ? content.platforms.join(', ') : 'No platforms'}`);
        });
        
        return contents;
    },
    
    testDataCreation: function() {
        console.log('🧪 Testing data creation...');
        const contents = storage.get('marketingContent') || [];
        
        if (contents.length === 0) {
            console.log('💡 No content found. You can create sample data for testing.');
            console.log('💡 Click "Create Content" button to add your first marketing content.');
        }
    },
    
    formatDisplayDate: function(dateString) {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },
    
    formatRelativeDate: function(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return this.formatDisplayDate(dateString);
    }
};

// Initialize marketing when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM loaded - initializing marketing');
    setTimeout(() => {
        marketing.init();
    }, 100);
});