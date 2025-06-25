// Database Check Script
// This script will help check the database structure and data

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'LynxLake',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const checkDatabase = {
  // Check if tables exist
  checkTables: async () => {
    console.log("=== Checking Database Tables ===");
    
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'projects', 'project_owners', 'files', 'file_tree', 'live_users', 'logs', 'chat_messages')
        ORDER BY table_name;
      `);
      
      console.log("Existing tables:", result.rows.map(row => row.table_name));
      return result.rows.length === 7; // Should have 7 main tables
    } catch (error) {
      console.error("Error checking tables:", error);
      return false;
    }
  },
  
  // Check files table structure
  checkFilesTable: async () => {
    console.log("=== Checking Files Table Structure ===");
    
    try {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'files' 
        ORDER BY ordinal_position;
      `);
      
      console.log("Files table columns:");
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking files table:", error);
      return false;
    }
  },
  
  // Check if there are any files in the database
  checkFilesData: async () => {
    console.log("=== Checking Files Data ===");
    
    try {
      const result = await pool.query(`
        SELECT 
          f.file_id,
          f.file_name,
          f.file_extension,
          f.project_id,
          f.file_created_by,
          f.file_data,
          f.updated_at,
          p.project_name
        FROM files f
        LEFT JOIN projects p ON f.project_id = p.project_id
        LIMIT 10;
      `);
      
      console.log(`Found ${result.rows.length} files:`);
      result.rows.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.file_name} (${file.file_extension}) - Project: ${file.project_name}`);
        console.log(`     ID: ${file.file_id}`);
        console.log(`     Content length: ${file.file_data?.length || 0} characters`);
        console.log(`     Updated: ${file.updated_at}`);
        console.log("");
      });
      
      return result.rows.length;
    } catch (error) {
      console.error("Error checking files data:", error);
      return 0;
    }
  },
  
  // Check projects table
  checkProjectsData: async () => {
    console.log("=== Checking Projects Data ===");
    
    try {
      const result = await pool.query(`
        SELECT 
          p.project_id,
          p.project_name,
          p.project_created_by,
          p.project_timestamp,
          COUNT(f.file_id) as file_count
        FROM projects p
        LEFT JOIN files f ON p.project_id = f.project_id
        GROUP BY p.project_id, p.project_name, p.project_created_by, p.project_timestamp
        LIMIT 10;
      `);
      
      console.log(`Found ${result.rows.length} projects:`);
      result.rows.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.project_name} - Created by: ${project.project_created_by}`);
        console.log(`     ID: ${project.project_id}`);
        console.log(`     Files: ${project.file_count}`);
        console.log(`     Created: ${project.project_timestamp}`);
        console.log("");
      });
      
      return result.rows.length;
    } catch (error) {
      console.error("Error checking projects data:", error);
      return 0;
    }
  },
  
  // Check file tree structure
  checkFileTree: async () => {
    console.log("=== Checking File Tree Structure ===");
    
    try {
      const result = await pool.query(`
        SELECT 
          ft.file_tree_id,
          ft.project_id,
          ft.parent_id,
          ft.name,
          ft.is_folder,
          f.file_id as linked_file_id
        FROM file_tree ft
        LEFT JOIN files f ON ft.file_tree_id = f.file_id
        LIMIT 10;
      `);
      
      console.log(`Found ${result.rows.length} file tree nodes:`);
      result.rows.forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.name} (${node.is_folder ? 'folder' : 'file'})`);
        console.log(`     Tree ID: ${node.file_tree_id}`);
        console.log(`     Parent ID: ${node.parent_id || 'root'}`);
        console.log(`     Linked File ID: ${node.linked_file_id || 'none'}`);
        console.log("");
      });
      
      return result.rows.length;
    } catch (error) {
      console.error("Error checking file tree:", error);
      return 0;
    }
  },
  
  // Test file content operations
  testFileOperations: async () => {
    console.log("=== Testing File Operations ===");
    
    try {
      // Get a sample file
      const fileResult = await pool.query(`
        SELECT file_id, project_id, file_name, file_data
        FROM files 
        LIMIT 1;
      `);
      
      if (fileResult.rows.length === 0) {
        console.log("No files found to test with");
        return false;
      }
      
      const testFile = fileResult.rows[0];
      console.log(`Testing with file: ${testFile.file_name} (${testFile.file_id})`);
      
      // Test updating file content
      const newContent = `// Updated content at ${new Date().toISOString()}\nconsole.log('Test content');`;
      
      const updateResult = await pool.query(`
        UPDATE files 
        SET file_data = $1, updated_at = CURRENT_TIMESTAMP
        WHERE file_id = $2
        RETURNING file_id, file_data, updated_at;
      `, [newContent, testFile.file_id]);
      
      if (updateResult.rows.length > 0) {
        console.log("File update successful");
        console.log(`Updated content length: ${updateResult.rows[0].file_data?.length || 0}`);
        console.log(`Updated at: ${updateResult.rows[0].updated_at}`);
        
        // Test reading file content
        const readResult = await pool.query(`
          SELECT file_data as content 
          FROM files 
          WHERE file_id = $1;
        `, [testFile.file_id]);
        
        if (readResult.rows.length > 0) {
          console.log("File read successful");
          console.log(`Read content length: ${readResult.rows[0].content?.length || 0}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error testing file operations:", error);
      return false;
    }
  },
  
  // Run all checks
  runAllChecks: async () => {
    console.log("Starting Database Checks...\n");
    
    const results = {
      tablesExist: await checkDatabase.checkTables(),
      filesTableStructure: await checkDatabase.checkFilesTable(),
      filesCount: await checkDatabase.checkFilesData(),
      projectsCount: await checkDatabase.checkProjectsData(),
      fileTreeCount: await checkDatabase.checkFileTree(),
      fileOperations: await checkDatabase.testFileOperations()
    };
    
    console.log("\n=== Database Check Results ===");
    console.log("Tables exist:", results.tablesExist ? "PASS" : "FAIL");
    console.log("Files table structure:", results.filesTableStructure ? "PASS" : "FAIL");
    console.log("Files count:", results.filesCount);
    console.log("Projects count:", results.projectsCount);
    console.log("File tree nodes:", results.fileTreeCount);
    console.log("File operations:", results.fileOperations ? "PASS" : "FAIL");
    
    const allPassed = results.tablesExist && results.filesTableStructure && results.fileOperations;
    console.log("Overall Result:", allPassed ? "DATABASE IS WORKING" : "DATABASE HAS ISSUES");
    
    return results;
  }
};

// Run checks if this file is executed directly
if (require.main === module) {
  checkDatabase.runAllChecks()
    .then(() => {
      console.log("\nDatabase check completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Database check failed:", error);
      process.exit(1);
    });
}

module.exports = checkDatabase; 