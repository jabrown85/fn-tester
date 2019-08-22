export async function userFn(payload:any) {
  console.log('USERFN_PAYLOAD:', payload)
  if (payload){
    return payload;
  }
  console.log("NO RETURN")
}

