import UserFunction from './userFunction'
import {SalesforceFunction} from './sf'

const sfFunc = new SalesforceFunction(new UserFunction())
export default sfFunc.invoker.bind(sfFunc)

// we could support this as well
// const sfFunc = new SalesforceFunction<MyFunction>()
// export default sfFunc.invoker.bind(sfFunc)

// or go with a static function that returns a matching function (like the js version)
// export default SalesforceFunction.invoke<MyFunction>()
