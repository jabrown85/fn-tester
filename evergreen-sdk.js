const evergreen = {
  createFunction: (userFn) => {
    const logger = console
    // MATCHES WHAT RIFF NEEDS
    const wrappingFn = (payload) => {
      try {
        const ctx = {
          headers: payload.headers
        }
        userFn(payload.payload, ctx, logger)
      } catch (error) {
        console.log('EVERGREEN SDK ERROR:', error)
      }
    }
    wrappingFn.$argumentTransformers = [
      (message) => {
        return message;
      }
    ];
    return wrappingFn
  }
}

module.exports = evergreen
