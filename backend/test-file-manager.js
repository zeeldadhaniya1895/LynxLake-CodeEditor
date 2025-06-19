// Test File Manager Functionality for Backend
// This file will help test all the file manager features

const pool = require("./db");
const queries = require("./queries/project");

const testFileManager = {
  // Test 1: Check database connection
  testDatabaseConnection: async () => {
    console.log("=== Testing Database Connection ===");
    
    try {
      const result = await pool.query("SELECT NOW() as current_time");
      console.log("Database connected successfully");
      console.log("Current time:", result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  },
  
  // Test 2: Check if files table exists and has data
  testFilesTable: async () => {
    console.log("=== Testing Files Table ===");
    
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
        LIMIT 5;
      `);
      
      console.log(`Found ${result.rows.length} files in database:`);
      result.rows.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.file_name} (${file.file_extension})`);
        console.log(`     ID: ${file.file_id}`);
        console.log(`     Project: ${file.project_name || 'Unknown'}`);
        console.log(`     Content length: ${file.file_data?.length || 0} characters`);
        console.log(`     Updated: ${file.updated_at}`);
        console.log("");
      });
      
      return result.rows.length;
    } catch (error) {
      console.error("Error checking files table:", error);
      return 0;
    }
  },

  // Test 3: Check projects table
  testProjectsTable: async () => {
    console.log("=== Testing Projects Table ===");
    
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
        LIMIT 5;
      `);
      
      console.log(`Found ${result.rows.length} projects in database:`);
      result.rows.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.project_name}`);
        console.log(`     ID: ${project.project_id}`);
        console.log(`     Created by: ${project.project_created_by}`);
        console.log(`     Files: ${project.file_count}`);
        console.log(`     Created: ${project.project_timestamp}`);
        console.log("");
      });
      
      return result.rows.length;
    } catch (error) {
      console.error("Error checking projects table:", error);
      return 0;
    }
  },

  // Test 4: Test file content operations
  testFileContentOperations: async () => {
    console.log("=== Testing File Content Operations ===");
    
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
      const newContent = `// Updated content at ${new Date().toISOString()}\nconsole.log('Test content');\n\nfunction test() {\n  return 'Hello from test';\n}`;
      
      const updateResult = await pool.query(queries.saveFile, [newContent, testFile.file_id]);
      console.log("File update query executed");
      
      // Test reading file content
      const readResult = await pool.query(queries.getInitialContentOfFile, [testFile.file_id]);
      
      if (readResult.rows.length > 0) {
        console.log("File read successful");
        console.log(`Read content length: ${readResult.rows[0].content?.length || 0}`);
        console.log(`Content preview: ${readResult.rows[0].content?.substring(0, 100)}...`);
        return true;
      } else {
        console.log("File read failed - no content found");
        return false;
      }
    } catch (error) {
      console.error("Error testing file operations:", error);
      return false;
    }
  },
  
  // Test 5: Test file creation
  testFileCreation: async () => {
    console.log("=== Testing File Creation ===");
    
    try {
      // Get a sample project
      const projectResult = await pool.query(`
        SELECT project_id, project_name
        FROM projects 
        LIMIT 1;
      `);
      
      if (projectResult.rows.length === 0) {
        console.log("No projects found to test with");
        return false;
      }
      
      const testProject = projectResult.rows[0];
      console.log(`Testing with project: ${testProject.project_name} (${testProject.project_id})`);
      
      // Test creating a new file
      const { v4: uuidv4 } = require("uuid");
      const uniqueId = uuidv4();
      const testFileName = `test-file-${Date.now()}.js`;
      
      const createResult = await pool.query(queries.createANewFile, [
        uniqueId,
        testProject.project_id,
        'zeelu', // You might need to use a real username
        testFileName,
        'js',
        JSON.stringify({})
      ]);
      
      console.log("File creation query executed");
      console.log(`Created file: ${testFileName} with ID: ${uniqueId}`);
      
      // Verify file was created
      const verifyResult = await pool.query(`
        SELECT file_id, file_name, file_extension, project_id
        FROM files 
        WHERE file_id = $1;
      `, [uniqueId]);
      
      if (verifyResult.rows.length > 0) {
        console.log("File creation verified successfully");
        return true;
      } else {
        console.log("File creation verification failed");
        return false;
      }
    } catch (error) {
      console.error("Error testing file creation:", error);
      return false;
    }
  },

  // Test 6: Test file tree operations
  testFileTreeOperations: async () => {
    console.log("=== Testing File Tree Operations ===");
    
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
        LIMIT 5;
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
      console.error("Error testing file tree operations:", error);
      return 0;
    }
  },
  
  // Run all tests
  runAllTests: async () => {
    console.log("Starting Backend File Manager Tests...\n");
    
    const results = {
      databaseConnection: await testFileManager.testDatabaseConnection(),
      filesCount: await testFileManager.testFilesTable(),
      projectsCount: await testFileManager.testProjectsTable(),
      fileContentOperations: await testFileManager.testFileContentOperations(),
      fileCreation: await testFileManager.testFileCreation(),
      fileTreeCount: await testFileManager.testFileTreeOperations()
    };
    
    console.log("\n=== Test Results ===");
    console.log("Database Connection:", results.databaseConnection ? "PASS" : "FAIL");
    console.log("Files count:", results.filesCount);
    console.log("Projects count:", results.projectsCount);
    console.log("File Content Operations:", results.fileContentOperations ? "PASS" : "FAIL");
    console.log("File Creation:", results.fileCreation ? "PASS" : "FAIL");
    console.log("File Tree nodes:", results.fileTreeCount);
    
    const allPassed = results.databaseConnection && results.fileContentOperations && results.fileCreation;
    console.log("Overall Result:", allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
    
    return results;
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testFileManager.runAllTests()
    .then(() => {
      console.log("\nBackend tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Backend tests failed:", error);
      process.exit(1);
    });
}

  module.exports = testFileManager;