/**
 * OxiCloud - UI Module
 * This file handles UI-related functions, view toggling, and interface interactions
 */

// UI Module
const ui = {
    /**
     * Initialize context menus and dialogs
     */
    initializeContextMenus() {
        // Folder context menu
        if (!document.getElementById('folder-context-menu')) {
            const folderMenu = document.createElement('div');
            folderMenu.className = 'context-menu';
            folderMenu.id = 'folder-context-menu';
            folderMenu.innerHTML = `
                <div class="context-menu-item" id="download-folder-option">
                    <i class="fas fa-download"></i> <span data-i18n="actions.download">Descargar</span>
                </div>
                <div class="context-menu-item" id="favorite-folder-option">
                    <i class="fas fa-star"></i> <span data-i18n="actions.favorite">Añadir a favoritos</span>
                </div>
                <div class="context-menu-item" id="rename-folder-option">
                    <i class="fas fa-edit"></i> <span data-i18n="actions.rename">Renombrar</span>
                </div>
                <div class="context-menu-item" id="move-folder-option">
                    <i class="fas fa-exchange-alt"></i> <span data-i18n="actions.move">Mover a...</span>
                </div>
                <div class="context-menu-item" id="share-folder-option">
                    <i class="fas fa-share-alt"></i> <span data-i18n="actions.share">Compartir</span>
                </div>
                <div class="context-menu-item" id="delete-folder-option">
                    <i class="fas fa-trash"></i> <span data-i18n="actions.delete">Eliminar</span>
                </div>
            `;
            document.body.appendChild(folderMenu);
        }

        // File context menu
        if (!document.getElementById('file-context-menu')) {
            const fileMenu = document.createElement('div');
            fileMenu.className = 'context-menu';
            fileMenu.id = 'file-context-menu';
            fileMenu.innerHTML = `
                <div class="context-menu-item" id="view-file-option">
                    <i class="fas fa-eye"></i> <span data-i18n="actions.view">Ver</span>
                </div>
                <div class="context-menu-item" id="download-file-option">
                    <i class="fas fa-download"></i> <span data-i18n="actions.download">Descargar</span>
                </div>
                <div class="context-menu-item" id="favorite-file-option">
                    <i class="fas fa-star"></i> <span data-i18n="actions.favorite">Añadir a favoritos</span>
                </div>
                <div class="context-menu-item" id="share-file-option">
                    <i class="fas fa-share-alt"></i> <span data-i18n="actions.share">Compartir</span>
                </div>
                <div class="context-menu-item" id="move-file-option">
                    <i class="fas fa-exchange-alt"></i> <span data-i18n="actions.move">Mover a...</span>
                </div>
                <div class="context-menu-item" id="delete-file-option">
                    <i class="fas fa-trash"></i> <span data-i18n="actions.delete">Eliminar</span>
                </div>
            `;
            document.body.appendChild(fileMenu);
        }

        // Rename dialog
        if (!document.getElementById('rename-dialog')) {
            const renameDialog = document.createElement('div');
            renameDialog.className = 'rename-dialog';
            renameDialog.id = 'rename-dialog';
            renameDialog.innerHTML = `
                <div class="rename-dialog-content">
                    <div class="rename-dialog-header" data-i18n="dialogs.rename_folder">Renombrar carpeta</div>
                    <input type="text" id="rename-input" data-i18n-placeholder="dialogs.new_name" placeholder="Nuevo nombre">
                    <div class="rename-dialog-buttons">
                        <button class="btn" id="rename-cancel-btn" data-i18n="actions.cancel">Cancelar</button>
                        <button class="btn btn-primary" id="rename-confirm-btn" data-i18n="actions.rename">Renombrar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(renameDialog);
        }

        // Move dialog
        if (!document.getElementById('move-file-dialog')) {
            const moveDialog = document.createElement('div');
            moveDialog.className = 'rename-dialog';
            moveDialog.id = 'move-file-dialog';
            moveDialog.innerHTML = `
                <div class="rename-dialog-content">
                    <div class="rename-dialog-header" data-i18n="dialogs.move_file">Mover archivo</div>
                    <p data-i18n="dialogs.select_destination">Selecciona la carpeta destino:</p>
                    <div id="folder-select-container" style="max-height: 200px; overflow-y: auto; margin: 15px 0; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
                        <!-- Las carpetas se cargarán aquí dinámicamente -->
                        <div class="folder-select-item" data-folder-id="">
                            <i class="fas fa-folder"></i> <span data-i18n="dialogs.root">Raíz</span>
                        </div>
                    </div>
                    <div class="rename-dialog-buttons">
                        <button class="btn" id="move-cancel-btn" data-i18n="actions.cancel">Cancelar</button>
                        <button class="btn btn-primary" id="move-confirm-btn" data-i18n="actions.move_to">Mover</button>
                    </div>
                </div>
            `;
            document.body.appendChild(moveDialog);
        }
        
        // Share dialog
        if (!document.getElementById('share-dialog')) {
            const shareDialog = document.createElement('div');
            shareDialog.className = 'share-dialog';
            shareDialog.id = 'share-dialog';
            shareDialog.innerHTML = `
                <div class="share-dialog-content">
                    <div class="share-dialog-header" data-i18n="dialogs.share_file">Compartir archivo</div>
                    <div class="shared-item-info">
                        <strong>Elemento:</strong> <span id="shared-item-name"></span>
                    </div>
                    
                    <div id="existing-shares-section" style="display:none; margin: 15px 0;">
                        <h3 data-i18n="dialogs.existing_shares">Enlaces compartidos existentes</h3>
                        <div id="existing-shares-container"></div>
                    </div>
                    
                    <div class="share-options">
                        <h3 data-i18n="dialogs.share_options">Opciones de compartición</h3>
                        
                        <div class="form-group">
                            <label for="share-password" data-i18n="dialogs.password">Contraseña (opcional):</label>
                            <input type="password" id="share-password" placeholder="Proteger con contraseña">
                        </div>
                        
                        <div class="form-group">
                            <label for="share-expiration" data-i18n="dialogs.expiration">Fecha de vencimiento (opcional):</label>
                            <input type="date" id="share-expiration">
                        </div>
                        
                        <div class="form-group">
                            <label data-i18n="dialogs.permissions">Permisos:</label>
                            <div class="permission-options">
                                <div class="permission-option">
                                    <input type="checkbox" id="share-permission-read" checked>
                                    <label for="share-permission-read" data-i18n="permissions.read">Lectura</label>
                                </div>
                                <div class="permission-option">
                                    <input type="checkbox" id="share-permission-write">
                                    <label for="share-permission-write" data-i18n="permissions.write">Escritura</label>
                                </div>
                                <div class="permission-option">
                                    <input type="checkbox" id="share-permission-reshare">
                                    <label for="share-permission-reshare" data-i18n="permissions.reshare">Permitir compartir</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="new-share-section" style="display:none; margin: 15px 0;">
                        <h3 data-i18n="dialogs.generated_link">Enlace generado</h3>
                        <div class="form-group">
                            <input type="text" id="generated-share-url" readonly>
                            <div class="share-link-actions">
                                <button class="btn btn-small" id="copy-share-btn">
                                    <i class="fas fa-copy"></i> <span data-i18n="actions.copy">Copiar</span>
                                </button>
                                <button class="btn btn-small" id="notify-share-btn">
                                    <i class="fas fa-envelope"></i> <span data-i18n="actions.notify">Notificar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="share-dialog-buttons">
                        <button class="btn" id="share-cancel-btn" data-i18n="actions.cancel">Cancelar</button>
                        <button class="btn btn-primary" id="share-confirm-btn" data-i18n="actions.share">Compartir</button>
                    </div>
                </div>
            `;
            document.body.appendChild(shareDialog);
            
            // Add event listeners for share dialog
            document.getElementById('share-cancel-btn').addEventListener('click', () => {
                contextMenus.closeShareDialog();
            });
            
            document.getElementById('share-confirm-btn').addEventListener('click', () => {
                contextMenus.createSharedLink();
            });
            
            document.getElementById('copy-share-btn').addEventListener('click', async () => {
                const shareUrl = document.getElementById('generated-share-url').value;
                await fileSharing.copyLinkToClipboard(shareUrl);
            });
            
            document.getElementById('notify-share-btn').addEventListener('click', () => {
                const shareUrl = document.getElementById('generated-share-url').value;
                contextMenus.showEmailNotificationDialog(shareUrl);
            });
        }
        
        // Notification dialog
        if (!document.getElementById('notification-dialog')) {
            const notificationDialog = document.createElement('div');
            notificationDialog.className = 'share-dialog';
            notificationDialog.id = 'notification-dialog';
            notificationDialog.innerHTML = `
                <div class="share-dialog-content">
                    <div class="share-dialog-header" data-i18n="dialogs.notify">Notificar enlace compartido</div>
                    
                    <p><strong>URL:</strong> <span id="notification-share-url"></span></p>
                    
                    <div class="form-group">
                        <label for="notification-email" data-i18n="dialogs.recipient">Destinatario:</label>
                        <input type="email" id="notification-email" placeholder="Correo electrónico">
                    </div>
                    
                    <div class="form-group">
                        <label for="notification-message" data-i18n="dialogs.message">Mensaje (opcional):</label>
                        <textarea id="notification-message" rows="3"></textarea>
                    </div>
                    
                    <div class="share-dialog-buttons">
                        <button class="btn" id="notification-cancel-btn" data-i18n="actions.cancel">Cancelar</button>
                        <button class="btn btn-primary" id="notification-send-btn" data-i18n="actions.send">Enviar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(notificationDialog);
            
            // Add event listeners for notification dialog
            document.getElementById('notification-cancel-btn').addEventListener('click', () => {
                contextMenus.closeNotificationDialog();
            });
            
            document.getElementById('notification-send-btn').addEventListener('click', () => {
                contextMenus.sendShareNotification();
            });
        }

        // Assign events to menu items
        if (window.contextMenus) {
            window.contextMenus.assignMenuEvents();
        } else {
            console.warn('contextMenus module not loaded');
        }
    },

    /**
     * Set up drag and drop functionality
     */
    setupDragAndDrop() {
        const dropzone = document.getElementById('dropzone');

        // Dropzone events
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('active');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('active');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('active');
            if (e.dataTransfer.files.length > 0) {
                fileOps.uploadFiles(e.dataTransfer.files);
            }
        });

        // Document-wide drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer.types.includes('Files')) {
                dropzone.style.display = 'block';
                dropzone.classList.add('active');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.clientX <= 0 || e.clientY <= 0 ||
                e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                dropzone.classList.remove('active');
                setTimeout(() => {
                    if (!dropzone.classList.contains('active')) {
                        dropzone.style.display = 'none';
                    }
                }, 100);
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('active');

            if (e.dataTransfer.files.length > 0) {
                fileOps.uploadFiles(e.dataTransfer.files);
            }

            setTimeout(() => {
                dropzone.style.display = 'none';
            }, 500);
        });
    },

    /**
     * Switch to grid view
     */
    switchToGridView() {
        const filesGrid = document.getElementById('files-grid');
        const filesListView = document.getElementById('files-list-view');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        filesGrid.style.display = 'grid';
        filesListView.style.display = 'none';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        window.app.currentView = 'grid';
        localStorage.setItem('oxicloud-view', 'grid');
    },

    /**
     * Switch to list view
     */
    switchToListView() {
        const filesGrid = document.getElementById('files-grid');
        const filesListView = document.getElementById('files-list-view');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        filesGrid.style.display = 'none';
        filesListView.style.display = 'flex';
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
        window.app.currentView = 'list';
        localStorage.setItem('oxicloud-view', 'list');
    },

    /**
     * Update breadcrumb navigation
     * @param {string} folderName - Name of the current folder
     */
    updateBreadcrumb(folderName) {
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = '';
        
        // Get user info to help determine home folder
        const USER_DATA_KEY = 'oxicloud_user';
        const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
        const username = userData.username || '';
        
        // Create the home item - for users, this is their personal folder
        const homeItem = document.createElement('span');
        homeItem.className = 'breadcrumb-item';
        
        // Helper function to safely get translation text
        const getTranslatedText = (key, defaultValue) => {
            if (!window.i18n || !window.i18n.t) return defaultValue;
            return window.i18n.t(key);
        };
        
        // First determine if the current view is the user's home folder 
        const isUserHomeFolder = username && window.app.userHomeFolderName && 
            window.app.userHomeFolderName.includes(username) && 
            folderName === window.app.userHomeFolderName;
            
        // Set appropriate text for home item
        if (isUserHomeFolder) {
            // If the current folder is the user's home folder, label it as "Home"
            homeItem.textContent = getTranslatedText('breadcrumb.home', 'Home');
        } else if (folderName && folderName.startsWith('Mi Carpeta')) {
            // If viewing a root folder but not the user's home folder, use its full name
            homeItem.textContent = folderName;
        } else {
            // Default - use "Home" label
            homeItem.textContent = getTranslatedText('breadcrumb.home', 'Home');
            
            // For searching, we might have a custom breadcrumb text
            if (folderName && folderName.startsWith('Búsqueda:')) {
                // We're in search mode - don't add click handler
                breadcrumb.appendChild(homeItem);
                return;
            }
        }
        
        // Add click handler - but only if we have a user home folder to return to
        if (window.app.userHomeFolderId) {
            homeItem.addEventListener('click', () => {
                window.app.currentPath = window.app.userHomeFolderId;
                this.updateBreadcrumb(window.app.userHomeFolderName || 'Home');
                window.loadFiles();
            });
        }
        
        breadcrumb.appendChild(homeItem);

        // If we have a subfolder, add it to the breadcrumb
        if (folderName && !folderName.startsWith('Mi Carpeta') && !folderName.startsWith('Búsqueda:')) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '>';
            breadcrumb.appendChild(separator);

            const folderItem = document.createElement('span');
            folderItem.className = 'breadcrumb-item';
            folderItem.textContent = folderName;
            breadcrumb.appendChild(folderItem);
        }
    },

    /**
     * Show notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showNotification(title, message) {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            `;
            document.body.appendChild(notification);
        } else {
            notification.querySelector('.notification-title').textContent = title;
            notification.querySelector('.notification-message').textContent = message;
        }

        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    },

    /**
     * Close folder context menu
     */
    closeContextMenu() {
        const menu = document.getElementById('folder-context-menu');
        if (menu) {
            menu.style.display = 'none';
            window.app.contextMenuTargetFolder = null;
        }
    },

    /**
     * Close file context menu
     */
    closeFileContextMenu() {
        const menu = document.getElementById('file-context-menu');
        if (menu) {
            menu.style.display = 'none';
            window.app.contextMenuTargetFile = null;
        }
    },

    /**
     * Update file icons based on file type
     */
    updateFileIcons() {
        const fileCards = document.querySelectorAll('.file-card');

        fileCards.forEach(card => {
            const fileName = card.querySelector('.file-name')?.textContent || '';
            const iconElement = card.querySelector('.file-icon');
            if (!iconElement) return;

            if (iconElement.classList.contains('folder-icon')) {
                iconElement.innerHTML = '';
            }
            else if (fileName.endsWith('.docx') || fileName.endsWith('.pdf') || fileName.endsWith('.txt') || fileName.endsWith('.xlsx')) {
                iconElement.classList.add('doc-icon');
                iconElement.innerHTML = '';
            }
            else if (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.jpeg')) {
                iconElement.classList.add('image-icon');
                iconElement.innerHTML = '';
            }
            else if (fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mov') || fileName.endsWith('.mkv')) {
                iconElement.classList.add('video-icon');
                iconElement.innerHTML = '';
            }
            else {
                const extension = fileName.split('.').pop().toLowerCase();

                if (['json', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(extension)) {
                    iconElement.className = 'file-icon code-icon';
                    iconElement.innerHTML = `
                        <div class="code-line-1"></div>
                        <div class="code-line-2"></div>
                        <div class="code-line-3"></div>
                    `;

                    if (extension === 'json') {
                        iconElement.classList.add('json-icon');
                    } else if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
                        iconElement.classList.add('js-icon');
                    } else if (extension === 'html') {
                        iconElement.classList.add('html-icon');
                    } else if (['css', 'scss'].includes(extension)) {
                        iconElement.classList.add('css-icon');
                    } else if (extension === 'py') {
                        iconElement.classList.add('py-icon');
                    }
                }
            }
        });
    },

    /**
     * Add folder to the view
     * @param {Object} folder - Folder object
     */
    addFolderToView(folder) {
        // Verificar si la carpeta ya existe en la vista para evitar duplicados
        if (document.querySelector(`.file-card[data-folder-id="${folder.id}"]`) || 
            document.querySelector(`.file-item[data-folder-id="${folder.id}"]`)) {
            console.log(`Carpeta ${folder.name} (${folder.id}) ya existe en la vista, no duplicando`);
            return;
        }
        
        console.log(`Añadiendo carpeta a la vista: ${folder.name} (${folder.id})`);
        
        // Grid view element
        const folderGridElement = document.createElement('div');
        folderGridElement.className = 'file-card';
        folderGridElement.dataset.folderId = folder.id;
        folderGridElement.dataset.folderName = folder.name;
        folderGridElement.dataset.parentId = folder.parent_id || "";
        folderGridElement.innerHTML = `
            <div class="file-icon folder-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div class="file-name">${folder.name}</div>
            <div class="file-info">Carpeta</div>
        `;

        // Drag and drop setup for folders
        if (window.app.currentPath !== "") {
            folderGridElement.setAttribute('draggable', 'true');

            folderGridElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', folder.id);
                e.dataTransfer.setData('application/oxicloud-folder', 'true');
                folderGridElement.classList.add('dragging');
            });

            folderGridElement.addEventListener('dragend', () => {
                folderGridElement.classList.remove('dragging');
                document.querySelectorAll('.drop-target').forEach(el => {
                    el.classList.remove('drop-target');
                });
            });
        }

        // Click to navigate
        folderGridElement.addEventListener('click', () => {
            window.app.currentPath = folder.id;
            this.updateBreadcrumb(folder.name);
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

        // Drop target setup
        folderGridElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            folderGridElement.classList.add('drop-target');
        });

        folderGridElement.addEventListener('dragleave', () => {
            folderGridElement.classList.remove('drop-target');
        });

        folderGridElement.addEventListener('drop', async (e) => {
            e.preventDefault();
            folderGridElement.classList.remove('drop-target');

            const id = e.dataTransfer.getData('text/plain');
            const isFolder = e.dataTransfer.getData('application/oxicloud-folder') === 'true';

            if (id) {
                if (isFolder) {
                    if (id === folder.id) {
                        alert("No puedes mover una carpeta a sí misma");
                        return;
                    }
                    await fileOps.moveFolder(id, folder.id);
                } else {
                    await fileOps.moveFile(id, folder.id);
                }
            }
        });

        document.getElementById('files-grid').appendChild(folderGridElement);

        // List view element - Mejorado
        const folderListElement = document.createElement('div');
        folderListElement.className = 'file-item';
        folderListElement.dataset.folderId = folder.id;
        folderListElement.dataset.folderName = folder.name;
        folderListElement.dataset.parentId = folder.parent_id || "";

        // Format date
        const modifiedDate = new Date(folder.modified_at * 1000);
        const formattedDate = modifiedDate.toLocaleDateString() + ' ' +
                             modifiedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Make draggable if not in root
        if (window.app.currentPath !== "") {
            folderListElement.setAttribute('draggable', 'true');

            folderListElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', folder.id);
                e.dataTransfer.setData('application/oxicloud-folder', 'true');
                folderListElement.classList.add('dragging');
            });

            folderListElement.addEventListener('dragend', () => {
                folderListElement.classList.remove('dragging');
                document.querySelectorAll('.drop-target').forEach(el => {
                    el.classList.remove('drop-target');
                });
            });
        }

        // Mejorado: Estructura y clases para la vista de lista
        folderListElement.innerHTML = `
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
            this.updateBreadcrumb(folder.name);
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

        // Drop target setup for list view
        folderListElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            folderListElement.classList.add('drop-target');
        });

        folderListElement.addEventListener('dragleave', () => {
            folderListElement.classList.remove('drop-target');
        });

        folderListElement.addEventListener('drop', async (e) => {
            e.preventDefault();
            folderListElement.classList.remove('drop-target');

            const id = e.dataTransfer.getData('text/plain');
            const isFolder = e.dataTransfer.getData('application/oxicloud-folder') === 'true';

            if (id) {
                if (isFolder) {
                    if (id === folder.id) {
                        alert("No puedes mover una carpeta a sí misma");
                        return;
                    }
                    await fileOps.moveFolder(id, folder.id);
                } else {
                    await fileOps.moveFile(id, folder.id);
                }
            }
        });

        document.getElementById('files-list-view').appendChild(folderListElement);
    },

    /**
     * Add file to the view
     * @param {Object} file - File object
     */
    addFileToView(file) {
        // Verificar si el archivo ya existe en la vista para evitar duplicados
        if (document.querySelector(`.file-card[data-file-id="${file.id}"]`) ||
            document.querySelector(`.file-item[data-file-id="${file.id}"]`)) {
            console.log(`Archivo ${file.name} (${file.id}) ya existe en la vista, no duplicando`);
            return;
        }
        
        console.log(`Añadiendo archivo a la vista: ${file.name} (${file.id})`);
        
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
        fileGridElement.className = 'file-card';
        fileGridElement.innerHTML = `
            <div class="file-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-info">Modificado ${formattedDate.split(' ')[0]}</div>
        `;

        fileGridElement.dataset.fileId = file.id;
        fileGridElement.dataset.fileName = file.name;
        fileGridElement.dataset.folderId = file.folder_id || "";

        // Make draggable
        fileGridElement.setAttribute('draggable', 'true');

        fileGridElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', file.id);
            fileGridElement.classList.add('dragging');
        });

        fileGridElement.addEventListener('dragend', () => {
            fileGridElement.classList.remove('dragging');
            document.querySelectorAll('.drop-target').forEach(el => {
                el.classList.remove('drop-target');
            });
        });

        // View or download on click
        fileGridElement.addEventListener('click', () => {
            // Track this file access for recent files
            if (window.recent) {
                document.dispatchEvent(new CustomEvent('file-accessed', {
                    detail: { file }
                }));
            }
            
            // Check if it's a viewable file type
            if ((file.mime_type && file.mime_type.startsWith('image/')) || 
                (file.mime_type && file.mime_type === 'application/pdf')) {
                // Open in the inline viewer
                if (window.inlineViewer) {
                    window.inlineViewer.openFile(file);
                } else if (window.fileViewer) {
                    // Fallback to standard file viewer
                    window.fileViewer.open(file);
                } else {
                    // No viewer available, download directly
                    window.location.href = `/api/files/${file.id}`;
                }
            } else {
                // For other file types, download directly
                window.location.href = `/api/files/${file.id}`;
            }
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

        document.getElementById('files-grid').appendChild(fileGridElement);

        // List view element - Mejorado con clases específicas y diseño mejorado
        const fileListElement = document.createElement('div');
        fileListElement.className = 'file-item';
        fileListElement.dataset.fileId = file.id;
        fileListElement.dataset.fileName = file.name;
        fileListElement.dataset.folderId = file.folder_id || "";

        fileListElement.innerHTML = `
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

        // Make draggable (list view)
        fileListElement.setAttribute('draggable', 'true');

        fileListElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', file.id);
            fileListElement.classList.add('dragging');
        });

        fileListElement.addEventListener('dragend', () => {
            fileListElement.classList.remove('dragging');
            document.querySelectorAll('.drop-target').forEach(el => {
                el.classList.remove('drop-target');
            });
        });

        // View or download on click
        fileListElement.addEventListener('click', () => {
            // Track this file access for recent files
            if (window.recent) {
                document.dispatchEvent(new CustomEvent('file-accessed', {
                    detail: { file }
                }));
            }
            
            // Check if it's a viewable file type
            if ((file.mime_type && file.mime_type.startsWith('image/')) || 
                (file.mime_type && file.mime_type === 'application/pdf')) {
                // Open in the inline viewer
                if (window.inlineViewer) {
                    window.inlineViewer.openFile(file);
                } else if (window.fileViewer) {
                    // Fallback to standard file viewer
                    window.fileViewer.open(file);
                } else {
                    // No viewer available, download directly
                    window.location.href = `/api/files/${file.id}`;
                }
            } else {
                // For other file types, download directly
                window.location.href = `/api/files/${file.id}`;
            }
        });

        // Context menu (list view)
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

        document.getElementById('files-list-view').appendChild(fileListElement);
    }
};

// Expose UI module globally
window.ui = ui;
