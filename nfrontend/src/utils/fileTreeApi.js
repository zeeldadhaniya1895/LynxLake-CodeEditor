// File tree API utility

export function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Auth-Token': localStorage.getItem('authToken') || '',
    'X-Username': localStorage.getItem('username') || ''
  };
}

export async function getFileTree(projectId) {
  try {
    const res = await fetch(`/api/editor/${projectId}/file-tree`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function createNode(projectId, { name, isFolder, parentId }) {
  try {
    const res = await fetch(`/api/editor/projects/${projectId}/file-tree`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, is_folder: isFolder, parent_id: parentId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteNode(projectId, fileTreeId) {
  try {
    const res = await fetch(`/api/editor/projects/${projectId}/file-tree/${fileTreeId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function renameNode(projectId, fileTreeId, newName) {
  try {
    const res = await fetch(`/api/editor/projects/${projectId}/file-tree/${fileTreeId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ newName })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function expandNode(projectId, fileTreeId, expand) {
  try {
    const res = await fetch(`/api/editor/${projectId}/files/${fileTreeId}/expand`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ expand })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Utility: Convert flat file tree array to nested tree structure
export function buildFileTree(flatArray, parentId = null) {
  const items = flatArray
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      id: item.file_tree_id, // for FileTreeNode compatibility
      isFolder: item.is_folder,
      items: buildFileTree(flatArray, item.file_tree_id)
    }));
  return items;
} 