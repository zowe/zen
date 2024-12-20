import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page';
import CertificatePage from '../Pages/Certificates.page';
import config from '../utils/config';
import { spawn } from 'child_process';
import path from 'path';
import { connectArgs, Script }  from '../setup';
let page: Page;


let electronApp: ElectronApplication
const CERTIFICATE_TITLE ='Certificates'
const VSAM_TITLE = 'CachingService'
const STCS_TITLE = 'Stcs'
const INSTALLATION_TITLE = 'Installation'
const SECURITY_TITLE = 'Security'
const VERIFY_CERTIFICATE_LIST = ['STRICT', 'NONSTRICT', 'DISABLED']
const values = [
    config.ZOWE_ROOT_DIR + '/keystore/localhost/localhost.keystore.p12',
    config.ZOWE_ROOT_DIR + '/keystore/localhost/localhost.truststore.p12',
    config.ZOWE_ROOT_DIR + '/keystore/localhost/localhost.key',
    config.ZOWE_ROOT_DIR + '/keystore/localhost/localhost.cer',
    config.ZOWE_ROOT_DIR + '/keystore/local_ca/local_ca.cer',
  ];
const script = new Script()



test.beforeAll(async () => {
  test.setTimeout(600000);
  try {
    await prepareEnvironment({ install: true, cleanup: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});


test.describe('CertificateTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let apfAuthPage : ApfAuthPage;
    let planningPage : PlanningPage;
	let installationTypePage : InstallationTypePage;
	let installationPage : InstallationPage;
	let networkingPage : NetworkingPage;
  let certificatePage : CertificatePage;
    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page = await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page)
      apfAuthPage = new ApfAuthPage(page);
	  installationTypePage = new InstallationTypePage(page);
	  installationPage = new InstallationPage(page);
	  networkingPage = new NetworkingPage(page);
    certificatePage = new CertificatePage(page)
      titlePage.navigateToConnectionTab()
	  await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
	  await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
   await planningPage.fillPlanningPageWithRequiredFields(config.ZOWE_ROOT_DIR,
   config.ZOWE_WORKSPACE_DIR,
	config.ZOWE_EXTENSION_DIR,
	config.ZOWE_LOG_DIR,
	config.JAVA_HOME,
	config.NODE_HOME,
	config.ZOSMF_HOST,
	config.ZOSMF_PORT,
	config.ZOSMF_APP_ID
 );
   await planningPage.clickValidateLocations()
   await planningPage.clickContinueToInstallation()
 await installationTypePage.downloadZowePaxAndNavigateToInstallationPage()
   await installationTypePage.clickOnContinueToUnpax()
 await installationTypePage.skipUnpax()
 await installationPage.fillAllFields(config.DATASET_PREFIX,
   config.PARM_LIB,
	config.PROC_LIB,
	config.JCL_LIB,
	config.LOAD_LIB,
	config.AUTH_LOAD_LIB,
	config.AUTH_PLUGIN_LIB
 )
 await installationPage.clickInstallMvsDatasets();
 await installationPage.clickContinueToNetworkSetup();
 await certificatePage.movetoCertificatePage();

    })

    test.afterEach(async () => {
     await electronApp.close()
   })

test('test title of page & required fields', async ({ page }) => {
   const title = await certificatePage.returnTitleOfCertiPage();
   expect(title).toBe(CERTIFICATE_TITLE);
   await certificatePage.clickOption2()
   await expect(certificatePage.keyringHeading).toBeTruthy()
   await expect(certificatePage.KeyringOwner).toBeTruthy()
   await expect(certificatePage.keyringLabel).toBeTruthy()
   await expect(certificatePage.keyringCaLabel).toBeTruthy()
   await expect(certificatePage.keyringConnect).toBeTruthy()
   await expect(certificatePage.keyringImport).toBeTruthy()
   await expect(certificatePage.keyringConnectUser).toBeTruthy()
   await expect(certificatePage.keyringDsName).toBeTruthy()
   await expect(certificatePage.keyringConnectLabel).toBeTruthy()
   await expect(certificatePage.keyringConnectPassword).toBeTruthy()
   await expect(certificatePage.KeyringZOSMF).toBeTruthy()
   await expect(certificatePage.keyringZOSMFUser).toBeTruthy()
   await expect(certificatePage.keyringZosmfCa).toBeTruthy()
   await certificatePage.clickOption1()
   await expect(certificatePage.option1).toBeTruthy()
   await expect(certificatePage.option2).toBeTruthy()
   await expect(certificatePage.keystore_directory).toBeTruthy()
   await expect(certificatePage.certificate_alias_name).toBeTruthy()
   await expect(certificatePage.keystore_password).toBeTruthy()
   await expect(certificatePage.ca_alias).toBeTruthy()
   await expect(certificatePage.ca_password).toBeTruthy()
   await expect(certificatePage.lock).toBeTruthy()
   await expect(certificatePage.import_keystore).toBeTruthy()
   await expect(certificatePage.import_password).toBeTruthy()
   await expect(certificatePage.import_alias).toBeTruthy()
   await expect(certificatePage.ca_common_name).toBeTruthy()
   await expect(certificatePage.common_name).toBeTruthy()
   await expect(certificatePage.org_unit).toBeTruthy()
   await expect(certificatePage.org_certificate).toBeTruthy()
   await expect(certificatePage.locality_of_cert).toBeTruthy()
   await expect(certificatePage.state_of_cert).toBeTruthy()
   await expect(certificatePage.country_of_cert).toBeTruthy()
   await expect(certificatePage.validity_of_cert).toBeTruthy()
   await expect(certificatePage.san).toBeTruthy()
   await expect(certificatePage.import_certificate_authorities).toBeTruthy()
   await expect(certificatePage.verify_certificates).toBeTruthy()
   const verifyList = await certificatePage.verifyCertificatesList();
   await expect(verifyList).toEqual(VERIFY_CERTIFICATE_LIST);
 })

test('Test init JCERACFKS certificates with NONSTRICT Mode', async ({ page }) => {
  await script.runCommand(`chmod -R 777 ${process.env.ZOWE_ROOT_DIR}/keystore &&
  rm -r ${process.env.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.viewYaml();
  await expect(certificatePage.editor_title_element).toBeTruthy(); 
  const updates = [
    { keyPath: 'pem:\\s*\\n\\s*key:\\s[^\\n]*\\n\\s*certificate:\\s[^\\n]*\\n\\s*certificateAuthorities:\\s[^\\n]*', newValue: ''},
    { keyPath: '(?<=alias:\\s).*$', newValue: 'ZWEMVDJS' },
    { keyPath: '(?<=truststore:\\s+(?:.*\\n)*?\\s+type:\\s*)\\S.*', newValue: 'JCERACFKS' },
    { keyPath: '(?<=keystore:\\s+(?:.*\\n)*?\\s+type:\\s*)\\S.*', newValue: 'JCERACFKS' },
    { keyPath: '(?<=password:\\s).*$', newValue: 'password' },
    { keyPath: '(?<=file:\\s).*$', newValue: 'safkeyring://ZWESMVD/ZoweKeyring' }
];
  await certificatePage.updateEditorYaml(updates);
  await certificatePage.closeButton();
  await certificatePage.viewYaml();
  const valueExists = await certificatePage.read_yaml();
  for (const { newValue } of updates) {
  if (newValue !== '') {
    await expect(valueExists).toContain(newValue);
  }
  }
  await certificatePage.closeButton();
  await certificatePage.fillKeystoreDir(`${config.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.select_VerifyCert('DISABLED');
  await certificatePage.initializeCert();
  const isWriteConfigCheckVisible = await certificatePage.isWriteConfigGreenCheckVisible();
  await expect(isWriteConfigCheckVisible).toBe(true);
  const isUploadConfigCheckVisible = await certificatePage.isUploadConfigGreenCheckVisible();
  await expect(isUploadConfigCheckVisible).toBe(true);
  const isInitCertCheckVisible = await certificatePage.isInitCertGreenCheckVisible();
  await expect(isInitCertCheckVisible).toBe(true);
  const is_ContinueButtonDisable = await certificatePage.isContinueButtonDisable();
  await expect(is_ContinueButtonDisable).toBe(false);
});

test('Test Skip certificate button is enable', async ({ page }) => {
  const isLaunchConfigEnable = await certificatePage.is_skipCertificateButtonEnable();
  expect(isLaunchConfigEnable).toBe(true);
  const title = await certificatePage.click_skipCertificate();
  expect(title).toBe(VSAM_TITLE);
})

test('Test view yaml & view job output button', async ({ page }) => {
  await certificatePage.viewYaml()
  await expect(certificatePage.editor_title_element).toBeTruthy();
  await certificatePage.closeButton()
  await certificatePage.click_viewAndSubmitJob()
  await expect(certificatePage.editor_title_element).toBeTruthy()
  await certificatePage.closeButton()
  })

test('test verify delete & add san button', async ({ page }) => {
  await certificatePage.add_SanButton();
  const isSanInputVisible1 = await certificatePage.isSanInputVisible();
  await expect(isSanInputVisible1).toBe(true);
  await certificatePage.add_SanDeleteButton();
  const isVisible = await certificatePage.is_deleteAlertVisible();
  await expect(isVisible).toBe(true);
  const alertText = await certificatePage.Verify_alertText();
  expect(alertText).toBe("Are you sure you want to delete the selected entry?");
  await certificatePage.accept_declinedAlert('Yes');
  const isSanInputVisible2 = await certificatePage.isSanInputVisible();
  await expect(isSanInputVisible2).toBe(false);
 });

test('Click Previous Step and verify that the Previous button is enabled.', async ({ page }) => {
  const is_prevButtonEnable = await certificatePage.isPreviousButtonEnable();
  expect(is_prevButtonEnable).toBe(true);
  const title = await certificatePage.returnTitleOfPrevPage();
  expect(title).toBe(STCS_TITLE);
});

test('Test save and close and Resume Progress', async ({ page }) => {
  await certificatePage.fillKeystoreDir(config.ZOWE_ROOT_DIR + '/keystore');
  certificatePage.click_saveAndClose()
  await titlePage.clickOnResumeProgress();
  await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
  await connectionPage.SubmitValidateCredential()
  const title = await certificatePage.returnTitleOfCertiPage();
  await expect(title).toBe(CERTIFICATE_TITLE);
  const keystoreValue = await certificatePage.get_keystore_value();
  await expect(keystoreValue).toBe(config.ZOWE_ROOT_DIR + '/keystore');
 });


test('Test init certificates with NONSTRICT Mode & verify keystore dir created sucessfully', async ({ page }) => {
  await script.runCommand(`chmod -R 777 ${process.env.ZOWE_ROOT_DIR}/keystore &&
  rm -r ${process.env.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.viewYaml();
  await expect(certificatePage.editor_title_element).toBeTruthy();
  await certificatePage.updateEditorYaml([{ keyPath: '/global/zowe', newValue: config.ZOWE_ROOT_DIR }]);
  await certificatePage.closeButton();
  await certificatePage.viewYaml();
  const valueExists = await certificatePage.read_yaml();
  for (const value of values) {
    await expect(valueExists).toContain(value);

  }
  await certificatePage.closeButton();
  await certificatePage.fillKeystoreDir(`${config.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.select_VerifyCert('NONSTRICT');
  const isBtnDisabledBeforeInit = await certificatePage.isContinueButtonDisable();
  await expect(isBtnDisabledBeforeInit).toBe(true);
  await certificatePage.initializeCert();
  const isWriteConfigCheckVisible = await certificatePage.isWriteConfigGreenCheckVisible();
  await expect(isWriteConfigCheckVisible).toBe(true);
  const isUploadConfigCheckVisible = await certificatePage.isUploadConfigGreenCheckVisible();
  await expect(isUploadConfigCheckVisible).toBe(true);
  const isInitCertCheckVisible = await certificatePage.isInitCertGreenCheckVisible();
  await expect(isInitCertCheckVisible).toBe(true);
  const is_ContinueButtonDisable = await certificatePage.isContinueButtonDisable();
  await expect(is_ContinueButtonDisable).toBe(false);
  const result = await script.runCommand(`ls -lt ${process.env.ZOWE_ROOT_DIR}`);
  await expect(result.details).toContain('keystore');
});

test('Test init certificates with Disabled Mode and verify certificates configured sucessfully on Z/os', async ({ page }) => {
  await script.runCommand(`chmod -R 777 ${process.env.ZOWE_ROOT_DIR}/keystore &&
  rm -r ${process.env.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.viewYaml();
  await expect(certificatePage.editor_title_element).toBeTruthy();
  await certificatePage.updateEditorYaml([{ keyPath: '/global/zowe', newValue: config.ZOWE_ROOT_DIR }]);
  await certificatePage.closeButton();
  await certificatePage.viewYaml();
  const valueExists = await certificatePage.read_yaml();
  for (const value of values) {
    await expect(valueExists).toContain(value);

  }
  await certificatePage.closeButton();
  await certificatePage.fillKeystoreDir(`${config.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.select_VerifyCert('DISABLED');

  await certificatePage.initializeCert();
  const isWriteConfigCheckVisible = await certificatePage.isWriteConfigGreenCheckVisible();
  await expect(isWriteConfigCheckVisible).toBe(true);
  const isUploadConfigCheckVisible = await certificatePage.isUploadConfigGreenCheckVisible();
  await expect(isUploadConfigCheckVisible).toBe(true);
  const isInitCertCheckVisible = await certificatePage.isInitCertGreenCheckVisible();
  await expect(isInitCertCheckVisible).toBe(true);
  const is_ContinueButtonDisable = await certificatePage.isContinueButtonDisable();
  await expect(is_ContinueButtonDisable).toBe(false);
  const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`);
  for (const value of values) {
    await expect(result.details).toContain(value);
  }
});

test('Test init certificates with Lock keystore dir', async ({ page }) => {
  await script.runCommand(`chmod -R 777 ${process.env.ZOWE_ROOT_DIR}/keystore &&
  rm -r ${process.env.ZOWE_ROOT_DIR}/keystore`);
  await certificatePage.viewYaml();
  await expect(certificatePage.editor_title_element).toBeTruthy();
  await certificatePage.updateEditorYaml([{ keyPath: '/global/zowe', newValue: config.ZOWE_ROOT_DIR }]);
  await certificatePage.closeButton();
  await certificatePage.fillKeystoreDir(`${config.ZOWE_ROOT_DIR}/keystore`);
  const isChecked = await certificatePage.Lock_checkbox_Ischecked();
  expect(isChecked).toBe(true); 
  await certificatePage.select_VerifyCert('DISABLED');
  await certificatePage.initializeCert();
  const is_ContinueButtonDisable = await certificatePage.isContinueButtonDisable();
  await expect(is_ContinueButtonDisable).toBe(false);
  const result = await script.runCommand(`ls -ld ${process.env.ZOWE_ROOT_DIR}/keystore |  awk '{print $1}'`);
  await expect(result.details).toContain('dr-x------');
});

});
