// API Test File for File Manager Endpoints
// This file will test the actual API endpoints

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'test-token'; // You'll need to get a real token
const TEST_USERNAME = 'zeelu'; // You'll need to use a real username

const testAPI = {
  // Test 1: Test file content loading
  testFileContentLoading: async () => {
    console.log("=== Testing File Content Loading API ===");
    
    try {
      // First get a list of files to find a valid fileId
      const filesResponse = await axios.get(`${BASE_URL}/project/get-all-files`, {
        params: { projectId: 'test-project-id' },
        headers: {
          'Auth-Token': TEST_TOKEN,
          'X-Username': TEST_USERNAME
        }
      });
      
      console.log("Files response:", filesResponse.status);
      console.log("Files data:", filesResponse.data);
      
      if (filesResponse.data && filesResponse.data.length > 0) {
        const testFile = filesResponse.data[0];
        console.log(`Testing with file: ${testFile.file_name} (${testFile.file_id})`);
        
        // Test loading file content
        const contentResponse = await axios.get(`${BASE_URL}/project/${testFile.project_id}/files/${testFile.file_id}/content`, {
          headers: {
            'Auth-Token': TEST_TOKEN,
            'X-Username': TEST_USERNAME
          }
        });
        
        console.log("Content response:", contentResponse.status);
        console.log("Content data:", contentResponse.data);
        
        return contentResponse.status === 200;
      } else {
        console.log("No files found to test with");
        return false;
      }
    } catch (error) {
      console.error("File content loading test failed:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 2: Test file saving
  testFileSaving: async () => {
    console.log("=== Testing File Saving API ===");
    
    try {
      // First get a list of files to find a valid fileId
      const filesResponse = await axios.get(`${BASE_URL}/project/get-all-files`, {
        params: { projectId: 'test-project-id' },
        headers: {
          'Auth-Token': TEST_TOKEN,
          'X-Username': TEST_USERNAME
        }
      });
      
      if (filesResponse.data && filesResponse.data.length > 0) {
        const testFile = filesResponse.data[0];
        console.log(`Testing with file: ${testFile.file_name} (${testFile.file_id})`);
        
        // Test saving file content
        const testContent = `// Test content updated at ${new Date().toISOString()}\nconsole.log('Hello from API test');\n\nfunction testFunction() {\n  return 'API test successful';\n}`;
        
        const saveResponse = await axios.post(`${BASE_URL}/project/${testFile.project_id}/files/${testFile.file_id}/save`, {
          projectId: testFile.project_id,
          fileId: testFile.file_id,
          content: testContent
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': TEST_TOKEN,
            'X-Username': TEST_USERNAME
          }
        });
        
        console.log("Save response:", saveResponse.status);
        console.log("Save data:", saveResponse.data);
        
        return saveResponse.status === 200;
      } else {
        console.log("No files found to test with");
        return false;
      }
    } catch (error) {
      console.error("File saving test failed:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 3: Test file creation
  testFileCreation: async () => {
    console.log("=== Testing File Creation API ===");
    
    try {
      const testFileName = `api-test-file-${Date.now()}.js`;
      
      const createResponse = await axios.post(`${BASE_URL}/project/test-project-id/files`, {
        projectId: 'test-project-id',
        newFile: testFileName,
        extension: 'js',
        filePermissions: {}
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': TEST_TOKEN,
          'X-Username': TEST_USERNAME
        }
      });
      
      console.log("Create response:", createResponse.status);
      console.log("Create data:", createResponse.data);
      
      return createResponse.status === 200;
    } catch (error) {
      console.error("File creation test failed:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 4: Test file tree loading
  testFileTreeLoading: async () => {
    console.log("=== Testing File Tree Loading API ===");
    
    try {
      const treeResponse = await axios.get(`${BASE_URL}/editor/${projectId}/file-tree`, { headers });
      
      console.log("File tree response:", treeResponse.status);
      console.log("File tree data length:", treeResponse.data?.length || 0);
      
      return treeResponse.status === 200;
    } catch (error) {
      console.error("File tree loading test failed:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 5: Test authentication
  testAuthentication: async () => {
    console.log("=== Testing Authentication ===");
    
    try {
      // Test without authentication
      const noAuthResponse = await axios.get(`${BASE_URL}/project/get-all-files`, {
        params: { projectId: 'test-project-id' }
      }).catch(error => error.response);
      
      console.log("No auth response:", noAuthResponse?.status);
      
      // Test with invalid authentication
      const invalidAuthResponse = await axios.get(`${BASE_URL}/project/get-all-files`, {
        params: { projectId: 'test-project-id' },
        headers: {
          'Auth-Token': 'invalid-token',
          'X-Username': 'invalid-user'
        }
      }).catch(error => error.response);
      
      console.log("Invalid auth response:", invalidAuthResponse?.status);
      
      return noAuthResponse?.status === 401 || noAuthResponse?.status === 403;
    } catch (error) {
      console.error("Authentication test failed:", error.message);
      return false;
    }
  },

  // Run all API tests
  runAllAPITests: async () => {
    console.log("Starting API Tests...\n");
    
    const results = {
      authentication: await testAPI.testAuthentication(),
      fileTreeLoading: await testAPI.testFileTreeLoading(),
      fileContentLoading: await testAPI.testFileContentLoading(),
      fileSaving: await testAPI.testFileSaving(),
      fileCreation: await testAPI.testFileCreation()
    };
    
    console.log("\n=== API Test Results ===");
    console.log("Authentication:", results.authentication ? "PASS" : "FAIL");
    console.log("File Tree Loading:", results.fileTreeLoading ? "PASS" : "FAIL");
    console.log("File Content Loading:", results.fileContentLoading ? "PASS" : "FAIL");
    console.log("File Saving:", results.fileSaving ? "PASS" : "FAIL");
    console.log("File Creation:", results.fileCreation ? "PASS" : "FAIL");
    
    const allPassed = Object.values(results).every(result => result);
    console.log("Overall Result:", allPassed ? "ALL API TESTS PASSED" : "SOME API TESTS FAILED");
    
    return results;
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI.runAllAPITests()
    .then(() => {
      console.log("\nAPI tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("API tests failed:", error);
      process.exit(1);
    });
}

module.exports = testAPI; 