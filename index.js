const { Message } = require('@projectriff/message');

module.exports = message => {
  console.log('===New Message===');
  console.log('PAYLOAD:', message.payload)
  console.log('HEADERS:', message.headers)
  console.log('===End Message===');
  return { success: true };
}

module.exports.$argumentType = 'message';
Message.install();
