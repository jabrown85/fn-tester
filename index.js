userFn = async payload => {
  console.log('USERFN_PAYLOAD:', payload)
  if (payload){
    return {whatever:true}
  }
  console.log("NO RETURN")
}

module.exports = userFn;
