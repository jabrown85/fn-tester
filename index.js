// EXAMPLE 1 - default riff
// user function

// const fn = (payload) => {
//   console.log('request started - in container')
//   console.log(payload)
//   console.log('request finished - in container')
//   return {done: true}
// };

// fn.$argumentTransformers = [
//   (message) => {
//     return message;
//   }
// ];

// module.exports = fn

const evergreen = {
  createFunction: (userFn) => {
    const logger = console
    // MATCHES WHAT RIFF NEEDS
    const wrappingFn = (payload) => {
      try {
        console.log('wrappingFnPayload', payload)
        const ctx = {
          headers: payload.headers
        }
        userFn(payload.payload, logger, ctx)
      } catch (error) {
        console.log('ERROR:', error)
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

// const evergreen = require('evergreen-sdk')
module.exports = evergreen.createFunction((payload, logger, ctx) => {
  logger.log('request started - in container')
  logger.log(payload)
  logger.log(ctx)
  logger.log('request finished - in container')
  return {done: true}
})

// this is what is needed to get the entire riff message (body + headers)
// module.exports.$argumentTransformers = [
//   (message) => {
//     return message;
//   }
// ];


// EXAMPLE 2 - evergreen.createFunction to generate signature
// this would be in require('heroku/evergreen-function') or some package
// const evergreen = {
//   createFunction: (userFn) => (payload) => {
//     const logger = console
//     const ctx = { requestId: "test" }
//     // userFn.$argumentTransformers = [
//     //   (message) => {
//     //     return message
//     //   }
//     // ]
//     return userFn

//     // return {
//     //   default: userFn(payload, logger, ctx),
//     //   '$argumentTransformers': [
//     //     (message) => {
//     //       return message
//     //     }
//     //   ]
//     // }
//   }
// }

// module.exports = evergreen.createFunction((payload, logger, ctx) => {
//   logger.log('request started - in container')
//   logger.log(payload, ctx)
//   logger.log('request finished - in container')
// })

// what are we exporting
console.log('exports:')
console.log(module.exports)
