import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';
let token = '';

async function runTests() {
    try {
        console.log('--- Starting API Verification ---');

        // 1. Login to get token
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test-user-789@example.com',
            password: 'StrongPassword123!'
        });
        token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   Login successful.');

        // 2. Test Project Creation
        console.log('2. Testing Project Creation...');
        const projectRes = await axios.post(`${API_URL}/projects`, {
            name: 'API Test Project',
            description: 'Created via verification script'
        }, config);
        
        if (projectRes.data.success) {
            console.log('   Project created successfully:', projectRes.data.project.name);
        } else {
            throw new Error('Project creation failed');
        }

        // 3. Test Project Retrieval
        console.log('3. Testing Project Retrieval...');
        const listRes = await axios.get(`${API_URL}/projects`, config);
        console.log(`   Found ${listRes.data.projects.length} projects.`);
        const found = listRes.data.projects.some(p => p.name === 'API Test Project');
        if (found) console.log('   New project found in list.');
        else throw new Error('New project NOT found in list');

        // 4. Test XSS Sanitization
        console.log('4. Testing XSS Sanitization...');
        const xssName = '<b>Dangerous</b><script>alert(1)</script>Name';
        const profileRes = await axios.put(`${API_URL}/profile`, { name: xssName }, config);
        
        const sanitizedName = profileRes.data.profile.name;
        console.log('   Sent:', xssName);
        console.log('   Received:', sanitizedName);
        
        if (sanitizedName.includes('<script>') || sanitizedName.includes('<b>')) {
            throw new Error('Sanitization FAILED! Tags still present.');
        } else {
            console.log('   Sanitization SUCCESSFUL. Tags stripped.');
        }

        console.log('\n--- All API Tests Passed! ---');
    } catch (error) {
        console.error('\n--- Test Failed! ---');
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

runTests();
