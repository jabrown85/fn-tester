export interface ISalesforceFunction {
  // this is the typing that would exist somewhere in the sdk
  // that allows the user to Implement the fn with the desired signature
  invoke(payload: any, sdk: ISalesforceSdk): any
}

export interface ISalesforceSdk {
  logger: Console
}

export class SalesforceFunction<T extends ISalesforceFunction> {
  constructor(private fnInstance: T) { }

  invoker(payload: any) {
    try {
      // this is where we would unwrap the payload, setup the sdk, etc.
      // this would transform the evergreen payload into the SF specific signature
      const sdk = {
        logger: console
      }
      return this.fnInstance.invoke(payload, sdk)
    } catch (error) {
      console.log('ERR in SFF invoker', error)
    }
  }
}
