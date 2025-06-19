const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8000';
const TEST_PROJECT_ID = '54337a61-8a72-4ad0-97cd-b56e466a32b4';
const TEST_FILE_ID = '336240cb-487f-4b44-8b13-94155a9e8660';

// Test headers (you'll need to replace with actual token and username)
const TEST_HEADERS = {
  'Auth-Token': 'your-auth-token-here',
  'X-Username': 'zeelu',
  'X-Image': 'avatar.png',
  'Content-Type': 'application/json'
};

// Test functions
const testEndpoints = async () => {
  console.log('🧪 Testing Editor Endpoints...\n');

  try {
    // Test 1: Get File Tree
    console.log('1️⃣ Testing GET /editor/:projectId/file-tree');
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_PROJECT_ID}/file-tree`, {
        headers: TEST_HEADERS
      });
      console.log('✅ File Tree Response:', response.data);
    } catch (error) {
      console.log('❌ File Tree Error:', error.response?.data || error.message);
    }

    // Test 2: Get File Content
    console.log('\n2️⃣ Testing GET /editor/:projectId/files/:fileId/content');
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_PROJECT_ID}/files/${TEST_FILE_ID}/content`, {
        headers: TEST_HEADERS
      });
      console.log('✅ File Content Response:', response.data);
    } catch (error) {
      console.log('❌ File Content Error:', error.response?.data || error.message);
    }

    // Test 3: Save File Content
    console.log('\n3️⃣ Testing POST /editor/:projectId/files/:fileId/save');
    try {
      const response = await axios.post(`${BASE_URL}/editor/${TEST_PROJECT_ID}/files/${TEST_FILE_ID}/save`, {
        content: 'console.log("Hello from new editor module!");'
      }, {
        headers: TEST_HEADERS
      });
      console.log('✅ Save File Response:', response.data);
    } catch (error) {
      console.log('❌ Save File Error:', error.response?.data || error.message);
    }

    // Test 4: Get Initial Tabs
    console.log('\n4️⃣ Testing GET /editor/:projectId/initial-tabs');
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_PROJECT_ID}/initial-tabs`, {
        headers: TEST_HEADERS
      });
      console.log('✅ Initial Tabs Response:', response.data);
    } catch (error) {
      console.log('❌ Initial Tabs Error:', error.response?.data || error.message);
    }

    // Test 5: Get Logs
    console.log('\n5️⃣ Testing GET /editor/:projectId/logs');
    try {
      const response = await axios.get(`${BASE_URL}/editor/${TEST_PROJECT_ID}/logs`, {
        headers: TEST_HEADERS
      });
      console.log('✅ Logs Response:', response.data);
    } catch (error) {
      console.log('❌ Logs Error:', error.response?.data || error.message);
    }

    // Test 6: Create New File
    console.log('\n6️⃣ Testing POST /editor/:projectId/create');
    try {
      const response = await axios.post(`${BASE_URL}/editor/${TEST_PROJECT_ID}/create`, {
        name: 'test-file.js',
        type: 'file',
        parentId: null
      }, {
        headers: TEST_HEADERS
      });
      console.log('✅ Create File Response:', response.data);
    } catch (error) {
      console.log('❌ Create File Error:', error.response?.data || error.message);
    }

    // Test 7: Set Expand Data
    console.log('\n7️⃣ Testing POST /editor/set-expand-data');
    try {
      const response = await axios.post(`${BASE_URL}/editor/set-expand-data`, {
        file_tree_id: TEST_FILE_ID,
        expand: true
      }, {
        headers: TEST_HEADERS
      });
      console.log('✅ Set Expand Data Response:', response.data);
    } catch (error) {
      console.log('❌ Set Expand Data Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
console.log('🚀 Starting Editor Endpoints Test...');
console.log('⚠️  Note: You need to replace TEST_HEADERS with actual authentication data\n');

testEndpoints(); 