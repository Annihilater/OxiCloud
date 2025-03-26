use serde::{Serialize, Deserialize};
use crate::domain::services::path_service::StoragePath;

/**
 * Represents errors that can occur during file entity operations.
 * 
 * This enum encapsulates various error conditions that may arise when creating,
 * validating, or manipulating file entities in the domain model.
 */
#[derive(Debug, thiserror::Error)]
pub enum FileError {
    /// Occurs when a file name contains invalid characters or is empty.
    #[error("Nombre de archivo inválido: {0}")]
    InvalidFileName(String),
    
    /// Occurs when validation fails for any file entity attribute.
    #[error("Error en la validación: {0}")]
    #[allow(dead_code)]
    ValidationError(String),
}

/**
 * Type alias for results of file entity operations.
 * 
 * Provides a convenient way to return either a successful value or a FileError.
 */
pub type FileResult<T> = Result<T, FileError>;

/**
 * Represents a file in the system's domain model.
 * 
 * The File entity is a core domain object that encapsulates all properties and behaviors
 * of a file in the system. It implements an immutable design pattern where modification
 * operations return new instances rather than modifying the existing one.
 * 
 * This entity maintains both physical storage information and logical metadata about files,
 * serving as the bridge between the storage system and the application.
 */
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct File {
    /// Unique identifier for the file - used throughout the system for file operations
    id: String,
    
    /// Name of the file including extension
    name: String,
    
    /// Path to the file in the domain model - not serialized as it contains internal representation
    #[serde(skip_serializing, skip_deserializing)]
    storage_path: StoragePath,
    
    /// String representation of the path for serialization and API compatibility
    #[serde(rename = "path")]
    path_string: String,
    
    /// Size of the file in bytes
    size: u64,
    
    /// MIME type of the file (e.g., "text/plain", "image/jpeg")
    mime_type: String,
    
    /// Parent folder ID if the file is within a folder, None if in root
    folder_id: Option<String>,
    
    /// Creation timestamp (seconds since UNIX epoch)
    created_at: u64,
    
    /// Last modification timestamp (seconds since UNIX epoch)
    modified_at: u64,
}

// Ya no necesitamos este módulo, ahora usamos un String directamente

impl Default for File {
    fn default() -> Self {
        Self {
            id: "stub-id".to_string(),
            name: "stub-file.txt".to_string(),
            storage_path: StoragePath::from_string("/"),
            path_string: "/".to_string(),
            size: 0,
            mime_type: "application/octet-stream".to_string(),
            folder_id: None,
            created_at: 0,
            modified_at: 0,
        }
    }
}

impl File {
    /// Crea un nuevo archivo con validación
    pub fn new(
        id: String,
        name: String,
        storage_path: StoragePath,
        size: u64,
        mime_type: String,
        folder_id: Option<String>,
    ) -> FileResult<Self> {
        // Validar nombre de archivo
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err(FileError::InvalidFileName(name));
        }
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        
        // Almacenamos el string de la ruta para compatibilidad con serialización
        let path_string = storage_path.to_string();
            
        Ok(Self {
            id,
            name,
            storage_path,
            path_string,
            size,
            mime_type,
            folder_id,
            created_at: now,
            modified_at: now,
        })
    }
    
    /// Crea un archivo con timestamps específicos (para reconstrucción)
    pub fn with_timestamps(
        id: String,
        name: String,
        storage_path: StoragePath,
        size: u64,
        mime_type: String,
        folder_id: Option<String>,
        created_at: u64,
        modified_at: u64,
    ) -> FileResult<Self> {
        // Validar nombre de archivo
        if name.is_empty() || name.contains('/') || name.contains('\\') {
            return Err(FileError::InvalidFileName(name));
        }
        
        // Almacenamos el string de la ruta para compatibilidad con serialización
        let path_string = storage_path.to_string();
            
        Ok(Self {
            id,
            name,
            storage_path,
            path_string,
            size,
            mime_type,
            folder_id,
            created_at,
            modified_at,
        })
    }
    
    // Getters
    pub fn id(&self) -> &str {
        &self.id
    }
    
    pub fn name(&self) -> &str {
        &self.name
    }
    
    pub fn storage_path(&self) -> &StoragePath {
        &self.storage_path
    }
    
    pub fn path_string(&self) -> &str {
        &self.path_string
    }
    
    pub fn size(&self) -> u64 {
        self.size
    }
    
    pub fn mime_type(&self) -> &str {
        &self.mime_type
    }
    
    pub fn folder_id(&self) -> Option<&str> {
        self.folder_id.as_deref()
    }
    
    pub fn created_at(&self) -> u64 {
        self.created_at
    }
    
    pub fn modified_at(&self) -> u64 {
        self.modified_at
    }
    
    /// Crea una nueva instancia de File desde un DTO
    /// Esta función es principalmente para conversiones en los batch handlers
    pub fn from_dto(
        id: String,
        name: String,
        path: String,
        size: u64,
        mime_type: String,
        folder_id: Option<String>,
        created_at: u64,
        modified_at: u64,
    ) -> Self {
        // Crear storage_path desde el string
        let storage_path = StoragePath::from_string(&path);
        
        // Crear directamente sin validación para evitar errores en conversiones DTO
        Self {
            id,
            name,
            storage_path,
            path_string: path,
            size,
            mime_type,
            folder_id,
            created_at,
            modified_at,
        }
    }
    
    // Métodos para crear nuevas versiones del archivo (inmutable)
    
    /// Crea una nueva versión del archivo con nombre actualizado
    #[allow(dead_code)]
    pub fn with_name(&self, new_name: String) -> FileResult<Self> {
        // Validar nombre de archivo
        if new_name.is_empty() || new_name.contains('/') || new_name.contains('\\') {
            return Err(FileError::InvalidFileName(new_name));
        }
        
        // Actualizar ruta basada en el nombre
        let parent_path = self.storage_path.parent();
        let new_storage_path = match parent_path {
            Some(parent) => parent.join(&new_name),
            None => StoragePath::from_string(&new_name),
        };
        
        // Actualizar representación en string
        let new_path_string = new_storage_path.to_string();
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
            
        Ok(Self {
            id: self.id.clone(),
            name: new_name,
            storage_path: new_storage_path,
            path_string: new_path_string,
            size: self.size,
            mime_type: self.mime_type.clone(),
            folder_id: self.folder_id.clone(),
            created_at: self.created_at,
            modified_at: now,
        })
    }
    
    /// Crea una nueva versión del archivo con carpeta actualizada
    pub fn with_folder(&self, folder_id: Option<String>, folder_path: Option<StoragePath>) -> FileResult<Self> {
        // Necesitamos una ruta de carpeta para actualizar la ruta del archivo
        let new_storage_path = match folder_path {
            Some(path) => path.join(&self.name),
            None => StoragePath::from_string(&self.name), // Raíz
        };
        
        // Actualizar representación en string
        let new_path_string = new_storage_path.to_string();
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
            
        Ok(Self {
            id: self.id.clone(),
            name: self.name.clone(),
            storage_path: new_storage_path,
            path_string: new_path_string,
            size: self.size,
            mime_type: self.mime_type.clone(),
            folder_id,
            created_at: self.created_at,
            modified_at: now,
        })
    }
    
    /// Crea una nueva versión del archivo con tamaño actualizado
    #[allow(dead_code)]
    pub fn with_size(&self, new_size: u64) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
            
        Self {
            id: self.id.clone(),
            name: self.name.clone(),
            storage_path: self.storage_path.clone(),
            path_string: self.path_string.clone(),
            size: new_size,
            mime_type: self.mime_type.clone(),
            folder_id: self.folder_id.clone(),
            created_at: self.created_at,
            modified_at: now,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_file_creation_with_valid_name() {
        let storage_path = StoragePath::from_string("/test/file.txt");
        let file = File::new(
            "123".to_string(),
            "file.txt".to_string(),
            storage_path,
            100,
            "text/plain".to_string(),
            None,
        );
        
        assert!(file.is_ok());
    }
    
    #[test]
    fn test_file_creation_with_invalid_name() {
        let storage_path = StoragePath::from_string("/test/invalid/file.txt");
        let file = File::new(
            "123".to_string(),
            "file/with/slash.txt".to_string(), // Nombre inválido
            storage_path,
            100,
            "text/plain".to_string(),
            None,
        );
        
        assert!(file.is_err());
        match file {
            Err(FileError::InvalidFileName(_)) => (),
            _ => panic!("Expected InvalidFileName error"),
        }
    }
    
    #[test]
    fn test_file_with_name() {
        let storage_path = StoragePath::from_string("/test/file.txt");
        let file = File::new(
            "123".to_string(),
            "file.txt".to_string(),
            storage_path,
            100,
            "text/plain".to_string(),
            None,
        ).unwrap();
        
        let renamed = file.with_name("newname.txt".to_string());
        assert!(renamed.is_ok());
        let renamed = renamed.unwrap();
        assert_eq!(renamed.name(), "newname.txt");
        assert_eq!(renamed.id(), "123"); // El ID no cambia
    }
}