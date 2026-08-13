const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('PUBLIC_KEY:', keys.publicKey);
console.log('PRIVATE_KEY:', keys.privateKey);
