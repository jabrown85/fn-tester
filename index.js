userFn = async payload => {
  console.log('build me 123')
  console.log('USERFN_PAYLOAD:', payload)
  if (payload){
    return payload;
  }
  console.log("NO RETURN")
}

module.exports = userFn;
