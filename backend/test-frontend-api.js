// Test Frontend API Calls
// This script will simulate the frontend API calls to test the endpoints

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';

// Test data from the logs
const TEST_DATA = {
  projectId: '54337a61-8a72-4ad0-97cd-b56e466a32b4',
  fileId: '336240cb-487f-4b44-8b13-94155a9e8660',
  username: 'zeelu', // or 'billu' based on your users table
  content: 'console.log("Hello from test!");\n\nfunction test() {\n  return "test function";\n}'
};

const testFrontendAPI = {
  // Test 1: Test file content loading (GET)
  testFileContentLoading: async () => {
    console.log("=== Testing File Content Loading ===");
    
    try {
      const response = await axios.get(`${BASE_URL}/project/${TEST_DATA.projectId}/files/${TEST_DATA.fileId}/content`, {
        headers: {
          'Auth-Token': 'test-token',
          'X-Username': TEST_DATA.username
        }
      });
      
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      return response.status === 200 && response.data.content !== undefined;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 2: Test file saving (POST)
  testFileSaving: async () => {
    console.log("=== Testing File Saving ===");
    
    try {
      const response = await axios.post(`${BASE_URL}/project/${TEST_DATA.projectId}/files/${TEST_DATA.fileId}/save`, {
        projectId: TEST_DATA.projectId,
        fileId: TEST_DATA.fileId,
        content: TEST_DATA.content
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': 'test-token',
          'X-Username': TEST_DATA.username
        }
      });
      
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      return response.status === 200;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 3: Test file tree loading
  testFileTreeLoading: async () => {
    console.log("=== Testing File Tree Loading ===");
    
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_DATA.projectId}/file-tree`, {
        headers: {
          'Auth-Token': 'test-token',
          'X-Username': TEST_DATA.username
        }
      });
      
      console.log("Status:", response.status);
      console.log("Data length:", response.data?.length || 0);
      
      return response.status === 200;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 4: Test initial tabs loading
  testInitialTabsLoading: async () => {
    console.log("=== Testing Initial Tabs Loading ===");
    
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_DATA.projectId}/initial-tabs`, {
        headers: {
          'Auth-Token': 'test-token',
          'X-Username': TEST_DATA.username
        }
      });
      
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      return response.status === 200;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return false;
    }
  },

  // Test 5: Test set expand data
  testSetExpandData: async () => {
    console.log("=== Testing Set Expand Data ===");
    
    try {
      const response = await axios.post(`${BASE_URL}/project/set-expand-data`, {
        file_tree_id: TEST_DATA.fileId,
        expand: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': 'test-token',
          'X-Username': TEST_DATA.username
        }
      });
      
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      return response.status === 200;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return false;
    }
  },

  // Run all tests
  runAllTests: async () => {
    console.log("Starting Frontend API Tests...\n");
    
    const results = {
      fileContentLoading: await testFrontendAPI.testFileContentLoading(),
      fileSaving: await testFrontendAPI.testFileSaving(),
      fileTreeLoading: await testFrontendAPI.testFileTreeLoading(),
      initialTabsLoading: await testFrontendAPI.testInitialTabsLoading(),
      setExpandData: await testFrontendAPI.testSetExpandData()
    };
    
    console.log("\n=== Frontend API Test Results ===");
    console.log("File Content Loading:", results.fileContentLoading ? "PASS" : "FAIL");
    console.log("File Saving:", results.fileSaving ? "PASS" : "FAIL");
    console.log("File Tree Loading:", results.fileTreeLoading ? "PASS" : "FAIL");
    console.log("Initial Tabs Loading:", results.initialTabsLoading ? "PASS" : "FAIL");
    console.log("Set Expand Data:", results.setExpandData ? "PASS" : "FAIL");
    
    const allPassed = Object.values(results).every(result => result);
    console.log("Overall Result:", allPassed ? "ALL FRONTEND API TESTS PASSED" : "SOME FRONTEND API TESTS FAILED");
    
    return results;
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testFrontendAPI.runAllTests()
    .then(() => {
      console.log("\nFrontend API tests completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Frontend API tests failed:", error);
      process.exit(1);
    });
}

module.exports = testFrontendAPI; 