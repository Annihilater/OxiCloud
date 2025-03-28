use std::sync::Arc;
use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

use crate::application::services::folder_service::FolderService;
use crate::application::dtos::folder_dto::{CreateFolderDto, RenameFolderDto, MoveFolderDto};
use crate::application::dtos::pagination::PaginationRequestDto;
use crate::common::errors::ErrorKind;
use crate::application::ports::inbound::FolderUseCase;
use crate::common::di::AppState as GlobalAppState;
use crate::interfaces::middleware::auth::AuthUser;

type AppState = Arc<FolderService>;

/// Handler for folder-related API endpoints
pub struct FolderHandler;

impl FolderHandler {
    /// Creates a new folder
    pub async fn create_folder(
        State(service): State<AppState>,
        Json(dto): Json<CreateFolderDto>,
    ) -> impl IntoResponse {
        match service.create_folder(dto).await {
            Ok(folder) => (StatusCode::CREATED, Json(folder)).into_response(),
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::AlreadyExists => StatusCode::CONFLICT,
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                (status, err.to_string()).into_response()
            }
        }
    }
    
    /// Gets a folder by ID
    pub async fn get_folder(
        State(service): State<AppState>,
        Path(id): Path<String>,
    ) -> impl IntoResponse {
        match service.get_folder(&id).await {
            Ok(folder) => (StatusCode::OK, Json(folder)).into_response(),
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                (status, err.to_string()).into_response()
            }
        }
    }
    
    /// Lists folders, optionally filtered by parent ID
    pub async fn list_folders(
        State(service): State<AppState>,
        parent_id: Option<&str>,
    ) -> impl IntoResponse {
        // Parent ID is already a &str
        
        match service.list_folders(parent_id).await {
            Ok(folders) => {
                // Always return an array even if empty
                (StatusCode::OK, Json(folders)).into_response()
            },
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                // Return a JSON error response
                (status, Json(serde_json::json!({
                    "error": err.to_string()
                }))).into_response()
            }
        }
    }
    
    /// Lists folders with pagination support
    pub async fn list_folders_paginated(
        State(service): State<AppState>,
        Query(pagination): Query<PaginationRequestDto>,
        parent_id: Option<&str>,
    ) -> impl IntoResponse {
        match service.list_folders_paginated(parent_id, &pagination).await {
            Ok(paginated_result) => {
                (StatusCode::OK, Json(paginated_result)).into_response()
            },
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                // Return a JSON error response
                (status, Json(serde_json::json!({
                    "error": err.to_string()
                }))).into_response()
            }
        }
    }
    
    /// Renames a folder
    pub async fn rename_folder(
        State(service): State<AppState>,
        Path(id): Path<String>,
        Json(dto): Json<RenameFolderDto>,
    ) -> impl IntoResponse {
        match service.rename_folder(&id, dto).await {
            Ok(folder) => (StatusCode::OK, Json(folder)).into_response(),
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    ErrorKind::AlreadyExists => StatusCode::CONFLICT,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                // Return a proper JSON error response
                (status, Json(serde_json::json!({
                    "error": err.to_string()
                }))).into_response()
            }
        }
    }
    
    /// Moves a folder to a new parent
    pub async fn move_folder(
        State(service): State<AppState>,
        Path(id): Path<String>,
        Json(dto): Json<MoveFolderDto>,
    ) -> impl IntoResponse {
        match service.move_folder(&id, dto).await {
            Ok(folder) => (StatusCode::OK, Json(folder)).into_response(),
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    ErrorKind::AlreadyExists => StatusCode::CONFLICT,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                (status, err.to_string()).into_response()
            }
        }
    }
    
    /// Deletes a folder (with trash support)
    pub async fn delete_folder(
        State(service): State<AppState>,
        Path(id): Path<String>,
    ) -> impl IntoResponse {
        // For folder deletion without trash functionality
        match service.delete_folder(&id).await {
            Ok(_) => StatusCode::NO_CONTENT.into_response(),
            Err(err) => {
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                (status, err.to_string()).into_response()
            }
        }
    }
    
    /// Deletes a folder with trash functionality
    pub async fn delete_folder_with_trash(
        State(state): State<GlobalAppState>,
        _auth_user: AuthUser,
        Path(id): Path<String>,
    ) -> impl IntoResponse {
        // Check if trash service is available
        if let Some(trash_service) = &state.trash_service {
            tracing::info!("Moving folder to trash: {}", id);
            
            // Try to move to trash first
            match trash_service.move_to_trash(&id, "folder", &"00000000-0000-0000-0000-000000000000".to_string()).await {
                Ok(_) => {
                    tracing::info!("Folder successfully moved to trash: {}", id);
                    return StatusCode::NO_CONTENT.into_response();
                },
                Err(err) => {
                    tracing::warn!("Could not move folder to trash, falling back to permanent delete: {}", err);
                    // Fall through to regular delete if trash fails
                }
            }
        }
        
        // Fallback to permanent delete if trash is unavailable or failed
        let folder_service = &state.applications.folder_service;
        match folder_service.delete_folder(&id).await {
            Ok(_) => {
                tracing::info!("Folder permanently deleted: {}", id);
                StatusCode::NO_CONTENT.into_response()
            },
            Err(err) => {
                tracing::error!("Error deleting folder: {}", err);
                
                let status = match err.kind {
                    ErrorKind::NotFound => StatusCode::NOT_FOUND,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                };
                
                (status, Json(serde_json::json!({
                    "error": format!("Error deleting folder: {}", err)
                }))).into_response()
            }
        }
    }
}