const evergreen = require('./evergreen-sdk')

const applySfFxMiddleware = (payload, ctx, logger) => {
  const data = payload.data;
  const userFxPayload = payload;

  let accessToken;
  let functionInvocationId;
  if (data.sfContext) {
    accessToken = data.sfContext.accessToken || undefined;
    functionInvocationId = data.sfContext.functionInvocationId || undefined;
    // Internal only
    delete data.sfContext;
  }

  //construct the sdk context, send it to the user function
  const sdkContext = createSdkContext(logger);

  return {
    userFxPayload,
    sdkContext
  }
}

function createSdkContext(logger) {
  console.log('created sdk context')
  return {
    sdkContext: true,
    logger
  }
}

const sfsdk = {
  createFunction: (userFn) => {
    const middlewareFn = (payload, ctx, logger) => {
      try {
        const result = applySfFxMiddleware(payload, ctx, logger)
        userFn(result.userFxPayload, result.sdkContext)
      } catch (error) {
        console.log('ERROR:', error)
      }
    }
    return evergreen.createFunction(middlewareFn)
  }
}

module.exports = sfsdk
