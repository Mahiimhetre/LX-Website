const BASE_URL = 'http://localhost:5000/api/v1';
const testEmail = `testuser_${Date.now()}@mailtest.com`;

// Try to register
const registerRes = await fetch(`${BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: testEmail,
    password: 'Test@12345!'
  })
});

const registerData = await registerRes.json();
console.log('Register Response:', registerRes.status);
console.log('Register Data:', JSON.stringify(registerData, null, 2));

// Now try login with the pre-existing account
const loginRes = await fetch(`${BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@locatorx.dev',
    password: 'Test@12345!'
  })
});

const loginData = await loginRes.json();
console.log('\nLogin Response:', loginRes.status);
console.log('Login Data:', JSON.stringify(loginData, null, 2));
