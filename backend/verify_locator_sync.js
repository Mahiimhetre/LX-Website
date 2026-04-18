import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let token = '';
let projectId = '';

async function runTests() {
    try {
        console.log('--- Starting Locator Sync Verification ---');

        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test-user-789@example.com',
            password: 'StrongPassword123!'
        });
        token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Login successful.');

        // 2. Fetch Projects to pick one
        const projectRes = await axios.get(`${API_URL}/projects`, config);
        projectId = projectRes.data.projects[0]?.id;
        if (!projectId) throw new Error('No projects found to test');
        console.log('✅ Found test project:', projectRes.data.projects[0].name);

        // 3. Simulate Extension: Saving a Locator
        console.log('3. Simulating Extension Save...');
        const saveRes = await axios.post(`${API_URL}/locators`, {
            name: 'Verification Button',
            selector: '//button[@id="verify"]',
            type: 'xpath',
            elementTag: 'button',
            pageUrl: 'https://example.com/login',
            projectId
        }, config);
        
        if (saveRes.data.success) {
            console.log('✅ Extension: Save success.');
        } else {
            throw new Error('Save locator failed');
        }

        // 4. Simulate Website: Fetching Locators for Project
        console.log('4. Simulating Website Fetch...');
        const listRes = await axios.get(`${API_URL}/locators/project/${projectId}`, config);
        console.log(`✅ Website: Found ${listRes.data.locators.length} locators.`);
        
        const found = listRes.data.locators.find(l => l.name === 'Verification Button');
        if (found) {
            console.log('✅ Website: Synced data matches extension input.');
            console.log('   Selector:', found.selector);
        } else {
            throw new Error('Website: New locator NOT found in sync');
        }

        console.log('\n--- Final Sync Verification SUCCESSFUL ---');
    } catch (error) {
        console.error('\n--- Sync Verification Failed! ---');
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

runTests();
