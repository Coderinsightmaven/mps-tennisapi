#!/usr/bin/env node

const crypto = require('crypto');

function generateApiKey(prefix = 'sk', env = 'prod') {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${env}_${randomBytes}`;
}

console.log('🔐 Generated API Keys:');
console.log('');
console.log('Development:', generateApiKey('mps', 'dev'));
console.log('Production: ', generateApiKey('mps', 'prod'));
console.log('');
console.log('💡 Usage:');
console.log('Set these in your environment variables:');
console.log('export API_KEYS="mps_dev_xxx,mps_prod_xxx"');
console.log('');
console.log('Or in your .env file:');
console.log('API_KEYS=mps_dev_xxx,mps_prod_xxx');
