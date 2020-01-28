const sfsdk = require('./sf-fx')
module.exports = sfsdk.createFunction((userFxPayload, sdkContext) => {
  sdkContext.logger.log('request started - in container')
  sdkContext.logger.log(userFxPayload)
  sdkContext.logger.log('request finished - in container')
})
