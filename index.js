userFn = async payload => {
  console.log('USERFN_PAYLOAD:', payload)
  if (payload){
    return payload;
  }
  console.log("NO RETURN")
}

module.exports = userFn;
