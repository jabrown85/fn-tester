public with sharing class FunctionApex {
    public static void test() {
        System.debug('Async invoking myfn');
        functions.Function myFunction = functions.Function.get('myfn');
        // Pass a callback to Function.invoke to perform an asynchronous invocation.
        functions.FunctionInvocation invocation = myFunction.invoke('{"fields":["Id","Name"]}', new DemoCallback());
    }

    public class DemoCallback implements functions.FunctionCallback {
        public void handleResponse(functions.FunctionInvocation result) {
            // Handle result of function invocation
            String jsonResponse = result.getResponse();
            System.debug('Got response ' + jsonResponse);

            // Log error, if applicable
            if (result.getStatus() == functions.FunctionInvocationStatus.FAILURE) {
                if (result.getError() != null) {
                    System.debug('Error: ' + result.getError().getMessage());
                    System.debug('Stack: ' + result.getError().getStack());
                } else {
                    System.debug('Error: UNKNOWN');
                }

                return;
            }
        }
    }
}