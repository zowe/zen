import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { ConnectionStore } from '../src/storage/ConnectionStore';
import Store from 'electron-store';

describe('ConnectionStore', () => {
  let storeGetStub: SinonStub;
  let storeSetStub: SinonStub;
  let storeDeleteStub: SinonStub;

  const storeDefault = {
    "connection-type": "ftp",
    "zowe-cli-version": "",
    "ftp-details": {
      "host": "",
      "port": "21",
      "user": "",
      "jobStatement": `//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,
//         MSGLEVEL=(1,1),MSGCLASS=A`
    },
    "cli-details": {
      "profile": ""
    }
  };

  beforeEach(() => {
    storeGetStub = sinon.stub(Store.prototype, 'get');
    storeSetStub = sinon.stub(Store.prototype, 'set');
    storeDeleteStub = sinon.stub(Store.prototype, 'delete');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get a value from the store', () => {
    const key = 'connection-type';
    const expectedValue = 'ftp';
    storeGetStub.withArgs(key).returns(expectedValue);
    const result = ConnectionStore.get(key);
    expect(result).to.equal(expectedValue);
  });

  it('should set a value in the store when validation succeeds', () => {
    const key = 'connection-type';
    const value = 'sftp';
    sinon.stub(ConnectionStore as any, 'validateWithSchema').returns(true);
    const result = ConnectionStore.set(key, value);
    expect(result).to.equal(true);
    sinon.assert.calledOnce(storeSetStub);
    sinon.assert.calledWithExactly(storeSetStub, key, value);
  });

  it('should get all values from the store', () => {
    const result = ConnectionStore.getAll();
    expect(result).to.deep.equal(storeDefault);
  });
});
