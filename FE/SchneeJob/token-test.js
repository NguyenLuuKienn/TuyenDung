/**
 * Test Token Persistence
 * Run this in browser console after login to verify token is saved correctly
 */

console.log('===== TOKEN PERSISTENCE TEST =====\n');

// Check localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('1. localStorage Check:');
console.log('   - token exists:', !!token);
console.log('   - user exists:', !!user);

if (token) {
  console.log('\n2. Token Format:');
  const parts = token.split('.');
  console.log('   - parts count:', parts.length, '(should be 3)');
  console.log('   - preview:', token.substring(0, 50) + '...');
  
  if (parts.length === 3) {
    try {
      // Decode payload
      const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decoded);
      
      console.log('\n3. Token Payload:');
      console.log('   - nameid:', payload.nameid);
      console.log('   - email:', payload.email);
      console.log('   - name:', payload.name);
      console.log('   - role:', payload.role);
      
      const nowTime = Date.now();
      const expTime = payload.exp * 1000;
      const isExpired = nowTime > expTime;
      
      console.log('\n4. Token Expiration:');
      console.log('   - exp claim:', new Date(expTime).toISOString());
      console.log('   - now:', new Date(nowTime).toISOString());
      console.log('   - expired?:', isExpired);
      console.log('   - expires in (minutes):', Math.round((expTime - nowTime) / 60000));
      
      if (!isExpired) {
        console.log('\n✓ Token is VALID and will persist after F5');
      } else {
        console.log('\n✗ Token is EXPIRED - will be cleared on F5');
      }
    } catch (e) {
      console.error('ERROR decoding token:', e.message);
    }
  }
} else {
  console.log('✗ No token in localStorage!');
}

if (user) {
  try {
    const parsedUser = JSON.parse(user);
    console.log('\n5. User Object:');
    console.log('   - id:', parsedUser.id);
    console.log('   - email:', parsedUser.email);
    console.log('   - fullName:', parsedUser.fullName);
    console.log('   - role:', parsedUser.role);
  } catch (e) {
    console.error('ERROR parsing user:', e.message);
  }
} else {
  console.log('\n✗ No user in localStorage!');
}

console.log('\n===== END TEST =====');
console.log('\nNext: Press F5 to reload and check if auth persists');
