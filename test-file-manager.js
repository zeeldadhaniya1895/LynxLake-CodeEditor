// Test File Manager Functionality
// This file will help test all the file manager features

const testFileManager = {
  // Test 1: Check if files are being saved correctly
  testFileSaving: async () => {
    console.log("=== Testing File Saving ===");
    
    // Test data
    const testData = {
      projectId: "54337a61-8a72-4ad0-97cd-b56e466a32b4",
      fileId: "336240cb-487f-4b44-8b13-94155a9e8660", 
      content: "console.log('Hello World!');\n\nfunction test() {\n  return 'test';\n}"
    };
    
    try {
      const response = await fetch(`/project/${testData.projectId}/files/${testData.fileId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': localStorage.getItem('authToken'),
          'X-Username': localStorage.getItem('username')
        },
        body: JSON.stringify({
          projectId: testData.projectId,
          fileId: testData.fileId,
          content: testData.content
        })
      });
      
      console.log("Save response:", response.status, response.statusText);
      const result = await response.json();
      console.log("Save result:", result);
      
      return response.ok;
    } catch (error) {
      console.error("Save test failed:", error);
      return false;
    }
  },
  
  // Test 2: Check if files are being loaded correctly
  testFileLoading: async () => {
    console.log("=== Testing File Loading ===");
    
    const testData = {
      projectId: "test-project-id",
      fileId: "test-file-id"
    };
    
    try {
      const response = await fetch(`/project/${testData.projectId}/files/${testData.fileId}/content`, {
        method: 'GET',
        headers: {
          'Auth-Token': localStorage.getItem('authToken'),
          'X-Username': localStorage.getItem('username')
        }
      });
      
      console.log("Load response:", response.status, response.statusText);
      const result = await response.json();
      console.log("Load result:", result);
      
      return response.ok && result.content !== undefined;
    } catch (error) {
      console.error("Load test failed:", error);
      return false;
    }
  },
  
  // Test 3: Check if file tree is working
  testFileTree: async () => {
    console.log("=== Testing File Tree ===");
    
    const projectId = "test-project-id";
    
    try {
      const response = await fetch(`/api/editor/${projectId}/file-tree`, {
        method: 'GET',
        headers: {
          'Auth-Token': localStorage.getItem('authToken'),
          'X-Username': localStorage.getItem('username')
        }
      });
      
      console.log("File tree response:", response.status, response.statusText);
      const result = await response.json();
      console.log("File tree result:", result);
      
      return response.ok;
    } catch (error) {
      console.error("File tree test failed:", error);
      return false;
    }
  },
  
  // Test 4: Check if new files can be created
  testFileCreation: async () => {
    console.log("=== Testing File Creation ===");
    
    const testData = {
      projectId: "test-project-id",
      newFile: "test-file.js",
      extension: "js",
      filePermissions: {}
    };
    
    try {
      const response = await fetch(`/project/${testData.projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': localStorage.getItem('authToken'),
          'X-Username': localStorage.getItem('username')
        },
        body: JSON.stringify(testData)
      });
      
      console.log("Create response:", response.status, response.statusText);
      const result = await response.json();
      console.log("Create result:", result);
      
      return response.ok;
    } catch (error) {
      console.error("Create test failed:", error);
      return false;
    }
  },
  
  // Run all tests
  runAllTests: async () => {
    console.log("Starting File Manager Tests...");
    
    const results = {
      fileSaving: await testFileManager.testFileSaving(),
      fileLoading: await testFileManager.testFileLoading(),
      fileTree: await testFileManager.testFileTree(),
      fileCreation: await testFileManager.testFileCreation()
    };
    
    console.log("=== Test Results ===");
    console.log("File Saving:", results.fileSaving ? "PASS" : "FAIL");
    console.log("File Loading:", results.fileLoading ? "PASS" : "FAIL");
    console.log("File Tree:", results.fileTree ? "PASS" : "FAIL");
    console.log("File Creation:", results.fileCreation ? "PASS" : "FAIL");
    
    const allPassed = Object.values(results).every(result => result);
    console.log("Overall Result:", allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
    
    return results;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testFileManager = testFileManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testFileManager;
} 