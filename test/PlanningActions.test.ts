import { expect } from 'chai';
import { PlanningActions } from '../src/actions/PlanningActions';
import sinon, { SinonStub } from 'sinon';

describe('PlanningActions', () => {
  let checkENVStub: SinonStub;
  let checkJavaStub: SinonStub;
  let checkNodeStub: SinonStub;
  let checkSpaceStub: SinonStub;
  let fetchStub: SinonStub;

  beforeEach(() => {
    checkENVStub = sinon.stub(PlanningActions, 'getENV');
    checkJavaStub = sinon.stub(PlanningActions, 'checkJava');
    checkNodeStub = sinon.stub(PlanningActions, 'checkNode');
    checkSpaceStub = sinon.stub(PlanningActions, 'checkSpace');
	fetchStub = sinon.stub(globalThis, 'fetch');
  });

  afterEach(() => {
    checkENVStub.restore();
    checkJavaStub.restore();
    checkNodeStub.restore();
    checkSpaceStub.restore();
	fetchStub.restore();
  });

  it('should handle success scenario', async () => {
    checkENVStub.resolves({ status: true, details: 'mock details' });
    checkJavaStub.resolves({ status: true, details: 'mock details' });
    checkNodeStub.resolves({ status: true, details: 'mock details' });
    checkSpaceStub.resolves({ status: true, details: 'mock details' });

    const fakeConnectionArgs = {
      host: 'fake-host',
      user: 'fake-user',
      password: 'fake-password',
      jobStatement: 'fake-job-statement',
    };

    const result = await PlanningActions.getENV(fakeConnectionArgs);

    expect(result.status).to.equal(true);
    expect(result.details).to.equal('mock details');
  });
  
  it('should get example Zowe data successfully', async () => {
    fetchStub.resolves({ text: () => Promise.resolve('exampleZoweData') });

    const result = await PlanningActions.getExampleZowe();

    expect(result.status).to.equal(true);
    expect(result.details).to.deep.equal('exampleZoweData');
  });
  
  it('should handle failure when fetching example Zowe data', async () => {
    fetchStub.rejects(new Error('Failed to fetch example Zowe data'));

    const result = await PlanningActions.getExampleZowe();

    expect(result.status).to.equal(false);
    expect(result.details).to.deep.equal({ error: 'Failed to fetch example Zowe data' });
  });

  it('should get Zowe schema successfully', async () => {
    fetchStub.resolves({ text: () => Promise.resolve('zoweYamlSchemaData') });
    const result = await PlanningActions.getZoweSchema();
    expect(result.status).to.equal(true);
    expect(result.details).to.deep.equal('zoweYamlSchemaData');
  });
  
  it('should handle failure when fetching Zowe schema', async () => {
    fetchStub.rejects(new Error('Failed to fetch Zowe schema'));
    const result = await PlanningActions.getZoweSchema();
    expect(result.status).to.equal(false);
    expect(result.details).to.deep.equal({ error: 'Failed to fetch Zowe schema' });
  });

  it('should handle failure scenario', async () => {
    checkENVStub.resolves({ status: false, details: 'mock failure' });
    checkJavaStub.resolves({ status: false, details: 'mock failure' });
    checkNodeStub.resolves({ status: false, details: 'mock failure' });
    checkSpaceStub.resolves({ status: false, details: 'mock failure' });
    const fakeConnectionArgs = {
      host: 'fake-host',
      user: 'fake-user',
      password: 'fake-password',
      jobStatement: 'fake-job-statement',
    };

    const result = await PlanningActions.getENV(fakeConnectionArgs);
    expect(result.status).to.equal(false);
    expect(result.details).to.equal('mock failure');
  });
});
