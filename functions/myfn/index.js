const sdk = require('@salesforce/salesforce-sdk');

/**
 * Describe Myfn here.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event:   represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Evergreen and your Salesforce org.
 * @param logger:  logging handler used to capture application logs and traces specific
 *                 to a given execution of a function.
 */
module.exports = async function (event, context, logger) {
    logger.info(`Invoking Myfn with payload ${JSON.stringify(event.data || {})}`);

    const acct = new sdk.SObject('Account');
    const name = event.data.AccountToCreate__c || 'MyAccount'
    acct.setValue('Name', `${name}-${Date.now()}`);
    const insertResult = await context.org.data.insert(acct);
    logger.info(JSON.stringify(insertResult));

    // Query Accounts to verify that our new Account was created.
    const fields = event.data.fields ? event.data.fields.join(', ') : 'Id, Name, CreatedDate'
    const soql = `SELECT ${fields} FROM Account ORDER BY CreatedDate DESC LIMIT 5`;
    logger.info(soql);
    const queryResults = await context.org.data.query(soql);
    logger.info(JSON.stringify(queryResults));
    return queryResults
}
