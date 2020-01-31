import {ISalesforceFunction, ISalesforceSdk} from './sf'
export default class UserFunction implements ISalesforceFunction {
  invoke(payload: any, sdk: ISalesforceSdk): string {
    sdk.logger.log("Hello", payload);
    return "GoodBye"
  }
}
