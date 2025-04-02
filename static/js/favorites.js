/**
 * OxiCloud - Favorites Module
 * This file handles favoriting files and folders, persisting favorites, and displaying favorite items
 */

// Favorites Module
const favorites = {
    // Key for storing favorites in localStorage
    STORAGE_KEY: 'oxicloud_favorites',
    
    // Flag to indicate if backend API is available
    backendApiAvailable: false,
    
    /**
     * Initialize favorites module
     */
    init() {
        console.log('Initializing favorites module');
        this.loadFavorites();
        
        // Check if backend favorites API is available
        this.checkBackendAvailability();
    },
    
    /**
     * Check if backend favorites API is available
     */
    async checkBackendAvailability() {
        try {
            const response = await fetch('/api/favorites', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('oxicloud_token')}`
                }
            });
            
            this.backendApiAvailable = response.ok;
            console.log(`Backend favorites API ${this.backendApiAvailable ? 'is' : 'is not'} available`);
            
            // If backend API is available, sync local favorites with server
            if (this.backendApiAvailable) {
                this.syncWithServer();
            }
        } catch (error) {
            console.warn('Error checking backend favorites API availability:', error);
            this.backendApiAvailable = false;
        }
    },
    
    /**
     * Sync local favorites with server
     */
    async syncWithServer() {
        try {
            // Get server favorites
            const response = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('oxicloud_token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            const serverFavorites = await response.json();
            const localFavorites = this.loadFavorites();
            
            console.log('Syncing favorites with server', { 
                serverCount: serverFavorites.length, 
                localCount: localFavorites.length 
            });
            
            // Create a map of server favorites for quick lookup
            const serverFavoritesMap = new Map();
            serverFavorites.forEach(item => {
                serverFavoritesMap.set(`${item.item_type}:${item.item_id}`, item);
            });
            
            // Add local favorites that aren't on server
            for (const localItem of localFavorites) {
                const key = `${localItem.type}:${localItem.id}`;
                if (!serverFavoritesMap.has(key)) {
                    console.log(`Adding local favorite to server: ${key}`);
                    await this.addToServerFavorites(localItem.id, localItem.type);
                }
            }
            
            // Store server favorites locally (complete sync)
            const mergedFavorites = serverFavorites.map(item => ({
                id: item.item_id,
                name: '', // Name will be populated when viewing favorites
                type: item.item_type,
                parentId: null, // Will be determined when viewing
                dateAdded: item.created_at
            }));
            
            this.saveFavorites(mergedFavorites);
            console.log('Favorites sync completed');
        } catch (error) {
            console.error('Error syncing favorites with server:', error);
        }
    },
    
    /**
     * Load favorites from localStorage
     * @returns {Array} Array of favorite items
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    },
    
    /**
     * Save favorites to localStorage
     * @param {Array} favorites - Array of favorite items to save
     */
    saveFavorites(favorites) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    },
    
    /**
     * Add a favorite to the server 
     * @param {string} id - Item ID
     * @param {string} type - 'file' or 'folder'
     */
    async addToServerFavorites(id, type) {
        try {
            const response = await fetch(`/api/favorites/${type}/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('oxicloud_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error adding favorite to server:', error);
            return false;
        }
    },
    
    /**
     * Remove a favorite from the server
     * @param {string} id - Item ID
     * @param {string} type - 'file' or 'folder'
     */
    async removeFromServerFavorites(id, type) {
        try {
            const response = await fetch(`/api/favorites/${type}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('oxicloud_token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error removing favorite from server:', error);
            return false;
        }
    },
    
    /**
     * Add an item to favorites
     * @param {string} id - Item ID
     * @param {string} name - Item name
     * @param {string} type - 'file' or 'folder'
     * @param {string} parentId - Parent folder ID (or null for root items)
     * @returns {boolean} Success status
     */
    async addToFavorites(id, name, type, parentId) {
        try {
            const favorites = this.loadFavorites();
            
            // Check if already in favorites
            if (favorites.some(item => item.id === id && item.type === type)) {
                console.log(`Item ${id} already in favorites`);
                return false;
            }
            
            // Add to favorites
            favorites.push({
                id,
                name,
                type,
                parentId: parentId || null,
                dateAdded: new Date().toISOString()
            });
            
            // Save updated favorites locally
            this.saveFavorites(favorites);
            
            // If backend API is available, sync with server
            if (this.backendApiAvailable) {
                await this.addToServerFavorites(id, type);
            }
            
            // Show success notification
            window.ui.showNotification(
                'Añadido a favoritos', 
                `"${name}" añadido a favoritos`
            );
            
            return true;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    },
    
    /**
     * Remove an item from favorites
     * @param {string} id - Item ID
     * @param {string} type - 'file' or 'folder'
     * @returns {boolean} Success status
     */
    async removeFromFavorites(id, type) {
        try {
            let favorites = this.loadFavorites();
            const initialLength = favorites.length;
            
            // Find the item to get its name for notification
            const item = favorites.find(item => item.id === id && item.type === type);
            
            // Filter out the item
            favorites = favorites.filter(item => !(item.id === id && item.type === type));
            
            // Save updated favorites locally
            this.saveFavorites(favorites);
            
            // If backend API is available, sync with server
            if (this.backendApiAvailable) {
                await this.removeFromServerFavorites(id, type);
            }
            
            // Check if anything was removed
            if (favorites.length < initialLength) {
                // Show success notification if item was found
                if (item) {
                    window.ui.showNotification(
                        'Eliminado de favoritos', 
                        `"${item.name}" eliminado de favoritos`
                    );
                }
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    },
    
    /**
     * Check if an item is in favorites
     * @param {string} id - Item ID
     * @param {string} type - 'file' or 'folder'
     * @returns {boolean} True if item is in favorites
     */
    isFavorite(id, type) {
        const favorites = this.loadFavorites();
        return favorites.some(item => item.id === id && item.type === type);
    },
    
    /**
     * Load and display favorite items in the UI
     */
    async displayFavorites() {
        try {
            const favorites = this.loadFavorites();
            
            // Clear existing content
            const filesGrid = document.getElementById('files-grid');
            const filesListView = document.getElementById('files-list-view');
            
            filesGrid.innerHTML = '';
            filesListView.innerHTML = `
                <div class="list-header">
                    <div data-i18n="files.name">Nombre</div>
                    <div data-i18n="files.type">Tipo</div>
                    <div data-i18n="files.size">Tamaño</div>
                    <div data-i18n="files.modified">Modificado</div>
                </div>
            `;
            
            // Update breadcrumb for favorites
            window.ui.updateBreadcrumb(window.i18n ? window.i18n.t('nav.favorites') : 'Favoritos');
            
            // Show empty state if no favorites
            if (favorites.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <i class="fas fa-star" style="font-size: 48px; color: #ddd; margin-bottom: 16px;"></i>
                    <p>${window.i18n ? window.i18n.t('favorites.empty_state') : 'No hay elementos favoritos'}</p>
                    <p>${window.i18n ? window.i18n.t('favorites.empty_hint') : 'Para marcar como favorito, haz clic derecho en cualquier archivo o carpeta'}</p>
                `;
                filesGrid.appendChild(emptyState);
                return;
            }
            
            // Load details for each favorite item
            let loadedItems = 0;
            const totalItems = favorites.length;
            
            // Process each favorite item
            for (const favorite of favorites) {
                try {
                    if (favorite.type === 'folder') {
                        await this.loadFolderDetails(favorite, filesGrid, filesListView);
                    } else {
                        await this.loadFileDetails(favorite, filesGrid, filesListView);
                    }
                } catch (error) {
                    console.error(`Error loading favorite ${favorite.type} ${favorite.id}:`, error);
                }
                
                // Update progress - could be used for loading indicator
                loadedItems++;
                console.log(`Loaded ${loadedItems}/${totalItems} favorite items`);
            }
            
            // Update file icons
            window.ui.updateFileIcons();
            
        } catch (error) {
            console.error('Error displaying favorites:', error);
            window.ui.showNotification('Error', 'Error al cargar elementos favoritos');
        }
    },
    
    /**
     * Load folder details and add to view
     * @param {Object} favorite - Favorite folder item
     * @param {HTMLElement} filesGrid - Grid view container
     * @param {HTMLElement} filesListView - List view container
     */
    async loadFolderDetails(favorite, filesGrid, filesListView) {
        try {
            const response = await fetch(`/api/folders/${favorite.id}`);
            
            if (response.ok) {
                const folder = await response.json();
                
                // Create UI element with favorite indicator
                this.createFavoriteFolderElement(folder, filesGrid, filesListView);
            } else if (response.status === 404) {
                // Folder not found, might be deleted
                console.log(`Favorite folder ${favorite.id} not found, removing from favorites`);
                this.removeFromFavorites(favorite.id, 'folder');
            } else {
                console.error(`Error loading folder ${favorite.id}:`, response.statusText);
            }
        } catch (error) {
            console.error(`Error loading folder details for ${favorite.id}:`, error);
        }
    },
    
    /**
     * Load file details and add to view
     * @param {Object} favorite - Favorite file item
     * @param {HTMLElement} filesGrid - Grid view container
     * @param {HTMLElement} filesListView - List view container
     */
    async loadFileDetails(favorite, filesGrid, filesListView) {
        try {
            const response = await fetch(`/api/files/${favorite.id}`);
            
            if (response.ok) {
                // Check if the response is JSON or binary data like a PDF
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    const file = await response.json();
                    
                    // Create UI element with favorite indicator
                    this.createFavoriteFileElement(file, filesGrid, filesListView);
                } else {
                    // For non-JSON responses (like PDFs or other binary files)
                    // Create a simplified file element with minimal information
                    const file = {
                        id: favorite.id,
                        name: favorite.name || `File ${favorite.id}`,
                        mime_type: contentType || 'application/octet-stream',
                        size: 0, // We don't know the size from this response
                        modified_at: Math.floor(Date.now() / 1000) // Current time in seconds
                    };
                    
                    this.createFavoriteFileElement(file, filesGrid, filesListView);
                }
            } else if (response.status === 404) {
                // File not found, might be deleted
                console.log(`Favorite file ${favorite.id} not found, removing from favorites`);
                this.removeFromFavorites(favorite.id, 'file');
            } else {
                console.error(`Error loading file ${favorite.id}:`, response.statusText);
            }
        } catch (error) {
            console.error(`Error loading file details for ${favorite.id}:`, error);
            
            // Create a fallback file element to prevent the favorite from disappearing
            const fallbackFile = {
                id: favorite.id,
                name: favorite.name || `File ${favorite.id}`,
                mime_type: 'application/octet-stream',
                size: 0,
                modified_at: Math.floor(Date.now() / 1000)
            };
            
            this.createFavoriteFileElement(fallbackFile, filesGrid, filesListView);
        }
    },
    
    /**
     * Create a folder element with favorite indicator
     * @param {Object} folder - Folder object
     * @param {HTMLElement} filesGrid - Grid view container
     * @param {HTMLElement} filesListView - List view container
     */
    createFavoriteFolderElement(folder, filesGrid, filesListView) {
        // Create standard folder element
        const folderGridElement = document.createElement('div');
        folderGridElement.className = 'file-card favorite-item';
        folderGridElement.dataset.folderId = folder.id;
        folderGridElement.dataset.folderName = folder.name;
        folderGridElement.dataset.parentId = folder.parent_id || "";
        
        // Add favorite star
        folderGridElement.innerHTML = `
            <div class="favorite-indicator active">
                <i class="fas fa-star"></i>
            </div>
            <div class="file-icon folder-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div class="file-name">${folder.name}</div>
            <div class="file-info">Carpeta</div>
        `;

        // Click to navigate
        folderGridElement.addEventListener('click', () => {
            window.app.currentPath = folder.id;
            window.ui.updateBreadcrumb(folder.name);
            window.loadFiles();
        });

        // Context menu
        folderGridElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            window.app.contextMenuTargetFolder = {
                id: folder.id,
                name: folder.name,
                parent_id: folder.parent_id || ""
            };

            let folderContextMenu = document.getElementById('folder-context-menu');
            folderContextMenu.style.left = `${e.pageX}px`;
            folderContextMenu.style.top = `${e.pageY}px`;
            folderContextMenu.style.display = 'block';
        });

        filesGrid.appendChild(folderGridElement);

        // Format date
        const modifiedDate = new Date(folder.modified_at * 1000);
        const formattedDate = modifiedDate.toLocaleDateString() + ' ' +
                             modifiedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // List view element
        const folderListElement = document.createElement('div');
        folderListElement.className = 'file-item favorite-item';
        folderListElement.dataset.folderId = folder.id;
        folderListElement.dataset.folderName = folder.name;
        folderListElement.dataset.parentId = folder.parent_id || "";

        folderListElement.innerHTML = `
            <div class="favorite-indicator active">
                <i class="fas fa-star"></i>
            </div>
            <div class="name-cell">
                <div class="file-icon folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <span>${folder.name}</span>
            </div>
            <div class="type-cell">${window.i18n ? window.i18n.t('files.file_types.folder') : 'Carpeta'}</div>
            <div class="size-cell">--</div>
            <div class="date-cell">${formattedDate}</div>
        `;

        // Click to navigate
        folderListElement.addEventListener('click', () => {
            window.app.currentPath = folder.id;
            window.ui.updateBreadcrumb(folder.name);
            window.loadFiles();
        });

        // Context menu
        folderListElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            window.app.contextMenuTargetFolder = {
                id: folder.id,
                name: folder.name,
                parent_id: folder.parent_id || ""
            };

            let folderContextMenu = document.getElementById('folder-context-menu');
            folderContextMenu.style.left = `${e.pageX}px`;
            folderContextMenu.style.top = `${e.pageY}px`;
            folderContextMenu.style.display = 'block';
        });

        filesListView.appendChild(folderListElement);
    },
    
    /**
     * Create a file element with favorite indicator
     * @param {Object} file - File object
     * @param {HTMLElement} filesGrid - Grid view container
     * @param {HTMLElement} filesListView - List view container
     */
    createFavoriteFileElement(file, filesGrid, filesListView) {
        // Determine icon and type
        let iconClass = 'fas fa-file';
        let iconSpecialClass = '';
        let typeLabel = 'Documento';

        if (file.mime_type) {
            if (file.mime_type.startsWith('image/')) {
                iconClass = 'fas fa-file-image';
                iconSpecialClass = 'image-icon';
                typeLabel = window.i18n ? window.i18n.t('files.file_types.image') : 'Imagen';
            } else if (file.mime_type.startsWith('text/')) {
                iconClass = 'fas fa-file-alt';
                iconSpecialClass = 'text-icon';
                typeLabel = window.i18n ? window.i18n.t('files.file_types.text') : 'Texto';
            } else if (file.mime_type.startsWith('video/')) {
                iconClass = 'fas fa-file-video';
                iconSpecialClass = 'video-icon';
                typeLabel = window.i18n ? window.i18n.t('files.file_types.video') : 'Video';
            } else if (file.mime_type.startsWith('audio/')) {
                iconClass = 'fas fa-file-audio';
                iconSpecialClass = 'audio-icon';
                typeLabel = window.i18n ? window.i18n.t('files.file_types.audio') : 'Audio';
            } else if (file.mime_type === 'application/pdf') {
                iconClass = 'fas fa-file-pdf';
                iconSpecialClass = 'pdf-icon';
                typeLabel = window.i18n ? window.i18n.t('files.file_types.pdf') : 'PDF';
            }
        }

        // Format size and date
        const fileSize = window.formatFileSize(file.size);
        const modifiedDate = new Date(file.modified_at * 1000);
        const formattedDate = modifiedDate.toLocaleDateString() + ' ' +
                            modifiedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Grid view element
        const fileGridElement = document.createElement('div');
        fileGridElement.className = 'file-card favorite-item';
        fileGridElement.dataset.fileId = file.id;
        fileGridElement.dataset.fileName = file.name;
        fileGridElement.dataset.folderId = file.folder_id || "";

        fileGridElement.innerHTML = `
            <div class="favorite-indicator active">
                <i class="fas fa-star"></i>
            </div>
            <div class="file-icon ${iconSpecialClass}">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-info">Modificado ${formattedDate.split(' ')[0]}</div>
        `;

        // Download on click
        fileGridElement.addEventListener('click', () => {
            window.location.href = `/api/files/${file.id}`;
        });

        // Context menu
        fileGridElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            window.app.contextMenuTargetFile = {
                id: file.id,
                name: file.name,
                folder_id: file.folder_id || ""
            };

            let fileContextMenu = document.getElementById('file-context-menu');
            fileContextMenu.style.left = `${e.pageX}px`;
            fileContextMenu.style.top = `${e.pageY}px`;
            fileContextMenu.style.display = 'block';
        });

        filesGrid.appendChild(fileGridElement);

        // List view element
        const fileListElement = document.createElement('div');
        fileListElement.className = 'file-item favorite-item';
        fileListElement.dataset.fileId = file.id;
        fileListElement.dataset.fileName = file.name;
        fileListElement.dataset.folderId = file.folder_id || "";

        fileListElement.innerHTML = `
            <div class="favorite-indicator active">
                <i class="fas fa-star"></i>
            </div>
            <div class="name-cell">
                <div class="file-icon ${iconSpecialClass}">
                    <i class="${iconClass}"></i>
                </div>
                <span>${file.name}</span>
            </div>
            <div class="type-cell">${typeLabel}</div>
            <div class="size-cell">${fileSize}</div>
            <div class="date-cell">${formattedDate}</div>
        `;

        // Download on click
        fileListElement.addEventListener('click', () => {
            window.location.href = `/api/files/${file.id}`;
        });

        // Context menu
        fileListElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            window.app.contextMenuTargetFile = {
                id: file.id,
                name: file.name,
                folder_id: file.folder_id || ""
            };

            let fileContextMenu = document.getElementById('file-context-menu');
            fileContextMenu.style.left = `${e.pageX}px`;
            fileContextMenu.style.top = `${e.pageY}px`;
            fileContextMenu.style.display = 'block';
        });

        filesListView.appendChild(fileListElement);
    }
};

// Expose favorites module globally
window.favorites = favorites;