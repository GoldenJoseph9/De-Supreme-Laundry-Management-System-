// ULTRA SIMPLE DOCUMENT SYSTEM - JUST PLAIN HTML FORMS
const ultraSimpleSystems = {
    init: function() {
        console.log('🚀 ULTRA SIMPLE SYSTEMS - No BS');
        this.showMainView();
    },
    
    showMainView: function() {
        const container = document.getElementById('systems-categories');
        if (!container) return;
        
        const documents = this.getDocuments();
        
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>📝 Business Documentation</h3>
                <p>Simple, unlimited writing space</p>
                
                <div style="margin: 2rem 0;">
                    <button onclick="ultraSimpleSystems.showNewDocumentForm()" 
                            style="padding: 1rem 2rem; font-size: 1.2rem; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        ✨ Create New Document
                    </button>
                </div>
                
                ${documents.length > 0 ? `
                    <div style="text-align: left; max-width: 600px; margin: 0 auto;">
                        <h4>Your Documents (${documents.length})</h4>
                        ${documents.map(doc => `
                            <div style="border: 1px solid #ddd; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; cursor: pointer;"
                                 onclick="ultraSimpleSystems.editDocument('${doc.id}')">
                                <strong>${doc.title}</strong>
                                <br>
                                <small>${doc.content.substring(0, 100)}...</small>
                                <br>
                                <small style="color: #666;">Last edited: ${new Date(doc.updatedAt).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="color: #666; margin-top: 2rem;">
                        No documents yet. Click the button above to create your first one!
                    </div>
                `}
            </div>
        `;
    },
    
    showNewDocumentForm: function() {
        const container = document.getElementById('systems-categories');
        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>📄 Create New Document</h3>
                
                <form onsubmit="ultraSimpleSystems.handleFormSubmit(event)">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Document Title:</label>
                        <input type="text" name="title" required 
                               style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;"
                               value="Untitled Document">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Category:</label>
                        <select name="category" style="padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="operations">Operations</option>
                            <option value="pricing">Pricing</option>
                            <option value="policies">Policies</option>
                            <option value="marketing">Marketing</option>
                            <option value="staff">Staff</option>
                            <option value="financial">Financial</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Content:</label>
                        <textarea name="content" rows="15" required
                                  style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif;"
                                  placeholder="Write your document content here... You can write as much as you want!"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" onclick="ultraSimpleSystems.showMainView()"
                                style="padding: 0.8rem 1.5rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                            ↩️ Cancel
                        </button>
                        
                        <button type="submit"
                                style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            💾 Save Document
                        </button>
                    </div>
                </form>
            </div>
        `;
    },
    
    handleFormSubmit: function(event) {
        event.preventDefault();
        console.log('📤 FORM SUBMITTED - This should work!');
        
        const formData = new FormData(event.target);
        const documentData = {
            id: 'doc_' + Date.now(),
            title: formData.get('title'),
            category: formData.get('category'),
            content: formData.get('content'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const documents = this.getDocuments();
        documents.push(documentData);
        localStorage.setItem('business_documents', JSON.stringify(documents));
        
        // Show success message
        alert('✅ Document saved successfully!');
        
        // Go back to main view
        this.showMainView();
    },
    
    editDocument: function(documentId) {
        const documents = this.getDocuments();
        const doc = documents.find(d => d.id === documentId);
        if (!doc) return;
        
        const container = document.getElementById('systems-categories');
        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>✏️ Edit Document</h3>
                
                <form onsubmit="ultraSimpleSystems.handleEditSubmit(event, '${doc.id}')">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Document Title:</label>
                        <input type="text" name="title" required 
                               style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;"
                               value="${doc.title}">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Category:</label>
                        <select name="category" style="padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="operations" ${doc.category === 'operations' ? 'selected' : ''}>Operations</option>
                            <option value="pricing" ${doc.category === 'pricing' ? 'selected' : ''}>Pricing</option>
                            <option value="policies" ${doc.category === 'policies' ? 'selected' : ''}>Policies</option>
                            <option value="marketing" ${doc.category === 'marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="staff" ${doc.category === 'staff' ? 'selected' : ''}>Staff</option>
                            <option value="financial" ${doc.category === 'financial' ? 'selected' : ''}>Financial</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Content:</label>
                        <textarea name="content" rows="15" required
                                  style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif;">${doc.content}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" onclick="ultraSimpleSystems.showMainView()"
                                style="padding: 0.8rem 1.5rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                            ↩️ Cancel
                        </button>
                        
                        <button type="submit"
                                style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            💾 Update Document
                        </button>
                        
                        <button type="button" onclick="ultraSimpleSystems.deleteDocument('${doc.id}')"
                                style="padding: 0.8rem 1.5rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🗑️ Delete
                        </button>
                    </div>
                </form>
            </div>
        `;
    },
    
    handleEditSubmit: function(event, documentId) {
        event.preventDefault();
        console.log('📤 EDIT FORM SUBMITTED');
        
        const formData = new FormData(event.target);
        
        const documents = this.getDocuments();
        const docIndex = documents.findIndex(d => d.id === documentId);
        
        if (docIndex !== -1) {
            documents[docIndex] = {
                ...documents[docIndex],
                title: formData.get('title'),
                category: formData.get('category'),
                content: formData.get('content'),
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('business_documents', JSON.stringify(documents));
            alert('✅ Document updated successfully!');
            this.showMainView();
        }
    },
    
    deleteDocument: function(documentId) {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        const documents = this.getDocuments();
        const filtered = documents.filter(d => d.id !== documentId);
        localStorage.setItem('business_documents', JSON.stringify(filtered));
        
        alert('🗑️ Document deleted!');
        this.showMainView();
    },
    
    getDocuments: function() {
        const stored = localStorage.getItem('business_documents');
        return stored ? JSON.parse(stored) : [];
    }
};

// In your main.js, just call:
// ultraSimpleSystems.init();