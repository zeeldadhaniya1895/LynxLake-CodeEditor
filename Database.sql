

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    image TEXT, 
    profile_image TEXT,
    username VARCHAR(255) UNIQUE NOT NULL,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    mode VARCHAR(255) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mode_check CHECK (mode IN ('manual', 'google'))
);


CREATE TABLE IF NOT EXISTS projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_created_by VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    allow_public_access BOOLEAN DEFAULT FALSE,
    project_settings JSONB DEFAULT '{}',
    project_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_owners (
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    invited_by VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_opened TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, username),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'guest'))
);

CREATE TABLE IF NOT EXISTS project_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    invited_username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    invited_by VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_invitation_role CHECK (role IN ('admin', 'editor', 'viewer', 'guest')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

CREATE TABLE IF NOT EXISTS file_tree (
    file_tree_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    parent_id UUID REFERENCES file_tree(file_tree_id) ON DELETE CASCADE,  
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN NOT NULL,
    file_permissions JSONB DEFAULT '{}',
    file_tree_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    file_created_by VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(255) NOT NULL,
    file_data TEXT,
    file_permissions JSONB DEFAULT '{}',
    is_archived BOOLEAN DEFAULT FALSE,
    version_number INTEGER DEFAULT 1,
    file_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_tree_expand_user (
    user_id VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    file_tree_id UUID REFERENCES file_tree(file_tree_id) ON DELETE CASCADE,
    is_expand BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, file_tree_id),
    file_tree_expand_user_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS live_users (
    file_id UUID REFERENCES files(file_id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,   
    username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    user_role VARCHAR(50) NOT NULL,
    is_active_in_tab BOOLEAN DEFAULT FALSE NOT NULL,
    is_live BOOLEAN DEFAULT FALSE NOT NULL,
    cursor_position JSONB,
    live_users_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id, username)
);

CREATE TABLE IF NOT EXISTS logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(file_id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    user_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    removed TEXT,
    text TEXT,
    from_line VARCHAR(255),
    from_ch VARCHAR(255),
    to_line VARCHAR(255),
    to_ch VARCHAR(255),
    origin VARCHAR(255),
    logs_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    user_role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_activity_log (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_owners_username ON project_owners(username);
CREATE INDEX IF NOT EXISTS idx_project_owners_project_id ON project_owners(project_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_live_users_file_id ON live_users(file_id);
CREATE INDEX IF NOT EXISTS idx_live_users_project_id ON live_users(project_id);
CREATE INDEX IF NOT EXISTS idx_file_tree_project_id ON file_tree(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_file_id ON logs(file_id);
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON logs(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_username ON project_invitations(invited_username);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_project_id ON project_activity_log(project_id);

-- Add comments for documentation
COMMENT ON TABLE project_owners IS 'Defines user roles and permissions for projects';
COMMENT ON COLUMN project_owners.role IS 'owner: full control, admin: manage users and settings, editor: create/edit files, viewer: read-only, guest: limited access';
COMMENT ON COLUMN project_owners.permissions IS 'JSON object with granular permissions';
COMMENT ON TABLE project_invitations IS 'Manages project invitations with username-based system';
COMMENT ON TABLE project_activity_log IS 'Audit trail for all project activities';
COMMENT ON TABLE file_tree IS 'Hierarchical file and folder structure for projects';
COMMENT ON TABLE files IS 'Individual files within projects with content and metadata';
COMMENT ON TABLE live_users IS 'Real-time collaboration tracking for active users';
COMMENT ON TABLE logs IS 'File editing history and change tracking';
COMMENT ON TABLE chat_messages IS 'Project chat and communication history';

