import { expect } from 'chai';
import { HomeActions } from '../src/actions/HomeActions';
import { ConnectionStore } from '../src/storage/ConnectionStore';
import sinon, { SinonStub } from 'sinon';

describe('HomeActions', () => {
  let connectionStoreGetStub: SinonStub;
  let connectionStoreSetStub: SinonStub;
  let connectionStoreGetAllStub: SinonStub;
  let checkZoweCLIStub: SinonStub;

  beforeEach(() => {
    connectionStoreGetStub = sinon.stub(ConnectionStore, 'get');
    connectionStoreSetStub = sinon.stub(ConnectionStore, 'set');
    connectionStoreGetAllStub = sinon.stub(ConnectionStore, 'getAll');
	checkZoweCLIStub = sinon.stub(HomeActions, 'checkZoweCLI');
  });

  afterEach(() => {
    connectionStoreGetStub.restore();
    connectionStoreSetStub.restore();
    connectionStoreGetAllStub.restore();
	checkZoweCLIStub.restore();
  });

  it('should check Zowe CLI version successfully', async () => {
    checkZoweCLIStub.resolves(true);
    const result = await HomeActions.checkZoweCLI();
    expect(result).to.equal(true);
  });

  it('should handle check Zowe CLI version failure', async () => {
  checkZoweCLIStub.rejects(new Error('Simulated failure'));

  try {
    await HomeActions.checkZoweCLI();

    expect.fail('Expected the function to throw an error for failure scenario');
  } catch (error) {
    expect(error.message).to.equal('Simulated failure');
  }
});

  it('should find previous installations', () => {
    connectionStoreGetAllStub.returns({ some: 'data' });
    const result = HomeActions.findPreviousInstallations();
    expect(result.status).to.equal(true);
    expect(result.details).to.deep.equal({ some: 'data' });
  });
});
