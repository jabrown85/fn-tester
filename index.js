const { Message } = require('@projectriff/message');
const v03 = require('cloudevents-sdk/v03')

userFn = async payload => {
  console.log('USERFN_PAYLOAD:', payload)
  return {success: true};
}

middleware = async message => {
  console.log('===New Message===');
  console.log('PAYLOAD:', message.payload)
  console.log('HEADERS:', message.headers)

  const unmarshaller = new v03.HTTPUnmarshaller();
  let result = null;

  // if we detect either structured or binary cloudevent payload, parse with the cloudevent sdk
  // this is triggered by knative cron/event source or direct with the right envelope
  if (message.headers.getValue('content-type').indexOf('application/cloudevents+json') > -1 ||
      message.headers.getValue('ce-specversion') != null) {
    // it's a structured or binary cloudevent, let's parse it into a cloudevent
    const protoHeaders = message.headers.toRiffHeaders()
    // beat the riff headers into submission for cloudevents sdk
    Object.keys(protoHeaders).map((key) => {protoHeaders[key] = message.headers.getValue(key)})
    try {
      const cloudevent = await unmarshaller.unmarshall(message.payload, protoHeaders)
      console.log('CLOUDEVENT:', cloudevent)
      result = await userFn(cloudevent.getData())
    } catch (error) {
      console.log('ERR:', error)
    }
  } else {
    // this would be a direct HTTP interaction with the function
    result = await userFn(message.payload)
  }
  console.log('RESULT:', result)
  console.log('===End Message===');
  return result;
}

module.exports = middleware;
module.exports.$argumentType = 'message';
Message.install();
