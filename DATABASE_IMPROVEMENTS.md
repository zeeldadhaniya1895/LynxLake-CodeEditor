# Database Schema Improvements and Role-Based Access Control

## Overview

This document outlines the comprehensive improvements made to the LynxLake database schema and backend to implement proper role-based access control (RBAC) and secure project sharing.

## Key Improvements

### 1. Enhanced Database Schema

#### A. Role-Based Access Control
- **Replaced `is_admin` boolean** with **`role` enum** in `project_owners` table
- **Five distinct roles**: `owner`, `admin`, `editor`, `viewer`, `guest`
- **Granular permissions** via JSONB `permissions` field
- **Invitation tracking** with `invited_by` and `invited_at` fields

#### B. New Tables Added
- **`project_invitations`**: Secure invitation system with tokens
- **`file_versions`**: Version control for files
- **`project_activity_log`**: Audit trail for all activities
- **Enhanced existing tables** with better foreign key constraints

#### C. Security Enhancements
- **Cascade deletes** for better data integrity
- **Indexes** for improved query performance
- **Activity logging** for audit trails
- **Invitation expiration** for security

### 2. Role Hierarchy and Permissions

```
Owner (Full Control)
├── Manage project settings
├── Add/remove users
├── Change user roles
├── Delete project
└── All other permissions

Admin (Management)
├── Add/remove users
├── Change user roles (except to owner)
├── Manage project settings
├── Create/edit/delete files
└── View all content

Editor (Content Management)
├── Create/edit files
├── Execute code
├── View all content
└── Participate in chat

Viewer (Read-Only)
├── View files
├── View chat
└── No editing capabilities

Guest (Limited Access)
├── View specific files (if permitted)
└── Limited chat access
```

### 3. Backend Improvements

#### A. Middleware System
- **`checkProjectAccess`**: Verifies user has access to project
- **`requireRole`**: Enforces role-based permissions
- **Activity logging**: Tracks all user actions

#### B. New API Endpoints

**Project Management:**
- `GET /:projectId` - Get project details with role info
- `GET /:projectId/members` - List project members with roles
- `PUT /:projectId/users/:username/role` - Update user role

**Invitation System:**
- `POST /:projectId/invitations` - Create project invitation
- `POST /invitations/:token/accept` - Accept invitation
- `GET /:projectId/invitations` - List pending invitations

**File Management:**
- `POST /:projectId/files` - Create file (editor+)
- `PUT /:projectId/files/:fileId/save` - Save file (editor+)
- `DELETE /:projectId/files/:fileId` - Delete file (admin+)

#### C. Enhanced Security
- **No public project access** - All access requires authentication
- **Role-based file operations** - Different permissions for different actions
- **Invitation tokens** - Secure project sharing
- **Activity audit trail** - Track all user actions

### 4. Database Migration Steps

#### Step 1: Backup Current Data
```sql
-- Backup existing data
CREATE TABLE project_owners_backup AS SELECT * FROM project_owners;
```

#### Step 2: Update Schema
```sql
-- Run the updated Database.sql file
-- This will create new tables and update existing ones
```

#### Step 3: Migrate Existing Data
```sql
-- Convert existing is_admin to roles
UPDATE project_owners 
SET role = CASE 
    WHEN is_admin = TRUE THEN 'admin' 
    ELSE 'viewer' 
END
WHERE role IS NULL;

-- Set project creators as owners
UPDATE project_owners po
SET role = 'owner'
FROM projects p
WHERE po.project_id = p.project_id 
AND po.username = p.project_created_by;
```

#### Step 4: Drop Old Columns
```sql
-- Remove old is_admin column
ALTER TABLE project_owners DROP COLUMN IF EXISTS is_admin;
```

### 5. Frontend Integration Points

#### A. Role-Based UI
```javascript
// Check user permissions
const canEdit = ['owner', 'admin', 'editor'].includes(userRole);
const canManageUsers = ['owner', 'admin'].includes(userRole);
const canDelete = ['owner', 'admin'].includes(userRole);

// Show/hide UI elements
{canManageUsers && <UserManagementPanel />}
{canEdit && <FileEditor />}
{canDelete && <DeleteButton />}
```

#### B. Invitation System
```javascript
// Create invitation
const createInvitation = async (email, role) => {
  const response = await fetch(`/api/editor/projects/${projectId}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitedEmail: email, role })
  });
};

// Accept invitation
const acceptInvitation = async (token) => {
  const response = await fetch(`/api/invitations/${token}/accept`, {
    method: 'POST'
  });
};
```

### 6. Security Features

#### A. Project Access Control
- **No direct link access** - Users must be explicitly added
- **Role-based permissions** - Different access levels
- **Invitation system** - Secure project sharing
- **Activity logging** - Audit trail

#### B. File-Level Security
- **Role-based file operations** - Different permissions per role
- **Version control** - Track file changes
- **Permission inheritance** - Project permissions apply to files

#### C. User Management
- **Invitation-based access** - No random access
- **Role hierarchy** - Clear permission structure
- **Activity tracking** - Monitor user actions

### 7. Performance Optimizations

#### A. Database Indexes
- **User lookups** - Fast project access checks
- **File queries** - Optimized file retrieval
- **Activity logs** - Efficient audit queries

#### B. Query Optimization
- **Role-based filtering** - Efficient permission checks
- **Cascade deletes** - Automatic cleanup
- **JSONB fields** - Flexible permissions storage

### 8. Migration Checklist

- [ ] Backup existing database
- [ ] Run updated schema
- [ ] Migrate existing user roles
- [ ] Update backend queries
- [ ] Test role-based access
- [ ] Update frontend components
- [ ] Test invitation system
- [ ] Verify security measures
- [ ] Update documentation

### 9. Benefits

1. **Enhanced Security**: No unauthorized project access
2. **Granular Control**: Different permission levels
3. **Audit Trail**: Track all user activities
4. **Scalable**: Easy to add new roles/permissions
5. **User-Friendly**: Clear permission structure
6. **Performance**: Optimized queries and indexes

### 10. Future Enhancements

- **File-level permissions**: Individual file access control
- **Time-based access**: Temporary project access
- **Advanced roles**: Custom permission sets
- **Integration**: SSO and external auth providers
- **Analytics**: Usage tracking and insights

This comprehensive update provides a robust, secure, and scalable foundation for the LynxLake platform with proper role-based access control and enhanced security features. 