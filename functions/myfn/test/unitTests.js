const expect = require('chai').expect;
const sinon = require('sinon');

const execute = require('../');

/**
 * Myfn unit tests.
 */

 describe('Unit Tests', () => {

    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Invoke Myfn', () => {
        // TODO
    });
});
