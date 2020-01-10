userFn = async payload => {
  console.log('Hello from riff')
  throw new 'AHHH';
}

module.exports = userFn;
