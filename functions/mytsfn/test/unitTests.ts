import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import execute from '../dist';

/**
 * Mytsfn unit tests.
 */

 describe('Unit Tests', () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

     it('Invoke Mytsfn', async () => {
         // TODO
    });
});
