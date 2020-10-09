public with sharing class FunctionApex {
    public static void test() {
        System.debug('Invoking myfn');

        functions.Function myFunction = functions.Function.get('myfn');
        functions.FunctionInvocation invocation = myFunction.invoke('{"fields":["Id","Name"]}');
        String jsonResponse = invocation.getResponse();

        System.debug('Response from myfn ' + jsonResponse);
    }
}