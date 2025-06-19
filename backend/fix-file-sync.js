// Fix File Sync Issues
// This script will fix the synchronization issues between file_tree and files tables

const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

const fixFileSync = {
  // Check the current state
  checkCurrentState: async () => {
    console.log("=== Checking Current State ===");
    
    try {
      // Check file_tree nodes that should have corresponding files
      const fileTreeResult = await pool.query(`
        SELECT 
          ft.file_tree_id,
          ft.project_id,
          ft.parent_id,
          ft.name,
          ft.is_folder,
          f.file_id as linked_file_id
        FROM file_tree ft
        LEFT JOIN files f ON ft.file_tree_id = f.file_id
        WHERE ft.is_folder = false
        ORDER BY ft.name;
      `);
      
      console.log(`Found ${fileTreeResult.rows.length} file nodes in file_tree:`);
      fileTreeResult.rows.forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.name} (${node.file_tree_id})`);
        console.log(`     Is folder: ${node.is_folder}`);
        console.log(`     Linked file: ${node.linked_file_id || 'MISSING'}`);
        console.log("");
      });
      
      return fileTreeResult.rows;
    } catch (error) {
      console.error("Error checking current state:", error);
      return [];
    }
  },

  // Get a valid username from users table
  getValidUsername: async () => {
    try {
      const result = await pool.query(`
        SELECT username FROM users LIMIT 1;
      `);
      
      if (result.rows.length > 0) {
        return result.rows[0].username;
      }
      return null;
    } catch (error) {
      console.error("Error getting valid username:", error);
      return null;
    }
  },

  // Fix missing files for file_tree nodes
  fixMissingFiles: async () => {
    console.log("=== Fixing Missing Files ===");
    
    try {
      // Get a valid username
      const username = await fixFileSync.getValidUsername();
      if (!username) {
        console.log("No valid username found in users table");
        return false;
      }
      
      console.log(`Using username: ${username}`);
      
      // Find file_tree nodes that don't have corresponding files
      const missingFilesResult = await pool.query(`
        SELECT 
          ft.file_tree_id,
          ft.project_id,
          ft.parent_id,
          ft.name,
          ft.is_folder
        FROM file_tree ft
        LEFT JOIN files f ON ft.file_tree_id = f.file_id
        WHERE ft.is_folder = false AND f.file_id IS NULL
        ORDER BY ft.name;
      `);
      
      console.log(`Found ${missingFilesResult.rows.length} missing files to create`);
      
      if (missingFilesResult.rows.length === 0) {
        console.log("No missing files to fix");
        return true;
      }
      
      // Create missing files
      for (const node of missingFilesResult.rows) {
        const fileExtension = node.name.split('.').pop() || 'txt';
        
        console.log(`Creating file: ${node.name} (${node.file_tree_id})`);
        
        await pool.query(`
          INSERT INTO files (
            file_id,
            project_id,
            file_created_by,
            file_name,
            file_extension,
            file_data,
            file_permissions
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (file_id) DO NOTHING;
        `, [
          node.file_tree_id,
          node.project_id,
          username,
          node.name,
          fileExtension,
          `// ${node.name}\n// Created automatically to fix sync issue\n\nconsole.log('Hello from ${node.name}');`,
          JSON.stringify({})
        ]);
        
        console.log(`Created file: ${node.name}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error fixing missing files:", error);
      return false;
    }
  },

  // Verify the fix
  verifyFix: async () => {
    console.log("=== Verifying Fix ===");
    
    try {
      const result = await pool.query(`
        SELECT 
          ft.file_tree_id,
          ft.name,
          ft.is_folder,
          f.file_id as linked_file_id,
          f.file_data
        FROM file_tree ft
        LEFT JOIN files f ON ft.file_tree_id = f.file_id
        WHERE ft.is_folder = false
        ORDER BY ft.name;
      `);
      
      console.log(`Verification - Found ${result.rows.length} file nodes:`);
      let allFixed = true;
      
      result.rows.forEach((node, index) => {
        const status = node.linked_file_id ? 'FIXED' : 'STILL MISSING';
        if (!node.linked_file_id) allFixed = false;
        
        console.log(`  ${index + 1}. ${node.name} - ${status}`);
        if (node.linked_file_id) {
          console.log(`     File ID: ${node.linked_file_id}`);
          console.log(`     Content length: ${node.file_data?.length || 0}`);
        }
        console.log("");
      });
      
      return allFixed;
    } catch (error) {
      console.error("Error verifying fix:", error);
      return false;
    }
  },

  // Run the complete fix
  runFix: async () => {
    console.log("Starting File Sync Fix...\n");
    
    const currentState = await fixFileSync.checkCurrentState();
    const fixApplied = await fixFileSync.fixMissingFiles();
    const fixVerified = await fixFileSync.verifyFix();
    
    console.log("\n=== Fix Results ===");
    console.log("Files found in file_tree:", currentState.length);
    console.log("Fix applied:", fixApplied ? "SUCCESS" : "FAILED");
    console.log("Fix verified:", fixVerified ? "SUCCESS" : "FAILED");
    
    const overallSuccess = fixApplied && fixVerified;
    console.log("Overall Result:", overallSuccess ? "FIX COMPLETED SUCCESSFULLY" : "FIX FAILED");
    
    return overallSuccess;
  }
};

// Run fix if this file is executed directly
if (require.main === module) {
  fixFileSync.runFix()
    .then(() => {
      console.log("\nFile sync fix completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("File sync fix failed:", error);
      process.exit(1);
    });
}

module.exports = fixFileSync; 