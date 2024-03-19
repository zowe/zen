import { test, expect } from '@playwright/test';
import { ElectronApplication, _electron as electron, Page } from 'playwright';
let electronApp: ElectronApplication;
let page: Page;

//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium';
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required';
const greenCheckIconSelector = 'svg[data-testid="CheckCircleOutlineIcon"]';
const mainXpath = '//html/body/div/div[2]/div/div[4]/div/form/div/div[3]/div[1]/div[3]/div/div[2]/div/div/div'
const writeConfig_greenCheckXpath = '#card-init-security-progress-card svg.MuiSvgIcon-colorSuccess'
const uploadYaml_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const init_security_greenCheckXpath = '#card-success-progress-card svg.MuiSvgIcon-colorSuccess'
const Skip_SecuritySelector = '//button[contains(text(), "Skip")]'
const Continue_CertificateSelector = '//button[contains(text(), "Continue to Certificates Setup")]'
const Save_CloseSelector='//button[contains(text(), "Save & close")]'
const monacoEditor_Selector = '//*[@id="monaco-editor-container"]'
const Previous_buttonSelector='//button[contains(text(), "Previous step")]'


async function setupPlanning(page: Page) {
  electronApp = await electron.launch({ args: ['.webpack/main/index.js'] });

  electronApp.on('window', async (window) => {
    const filename = window.url()?.split('/').pop();
    console.log(`Window opened: ${filename}`);
    window.on('pageerror', (error) => {
      console.error(error);
    });
    window.on('console', (msg) => {
      console.log(msg.text());
    });

    await window.waitForSelector('#card-install');
    await window.click('#card-install').catch((error) => {
      console.error("Error clicking '#card-install':", error);
    });
  });
  page = await electronApp.firstWindow();
  await page.waitForTimeout(1000);
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.click('button.MuiButton-root')
  await page.waitForTimeout(1000);
  await page.waitForSelector(greenCheckIconSelector);
  const isGreenCheckIconVisible = await page.isVisible(greenCheckIconSelector);
  await page.click(continueButtonSelector)
  await page.locator("//button[contains(text(), 'Save and validate')]").click();
  await page.waitForTimeout(5000);
  await page.getByLabel('Run-time Directory (or installation location)').fill('/u/ts5223');
  await page.getByLabel('Workspace Directory').fill('/u/ts5223/workspace');
  await page.getByLabel('Extensions Directory').fill('/u/ts5223/extension');
  await page.getByLabel('Log Directory').fill('/u/ts5223/logs');
  await page.getByLabel('Rbac Profile Identifier').fill('1');
  await page.getByLabel('Job Name').fill('ZWEMVDHP');
  await page.getByLabel('Job Prefix').fill('ZWE');
  await page.getByLabel('Java location').fill('/rsusr/java/IBM/J8.0_64.sr7fp11');
  await page.getByLabel('Node.js location').fill('/proj/mvd/node/installs/node-v18.18.2-os390-s390x-202310180251');
  await page.getByLabel('z/OSMF Application Id').fill('IZUDFLT');
  await page.locator("//button[contains(text(), 'Validate locations')]").click();
  await page.waitForTimeout(2000);
  await page.locator("//button[contains(text(), 'Continue to Installation Options')]").click();
}


async function setupPage(page: Page) {
  await setupPlanning();
  page = await electronApp.firstWindow();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'License Agreement')]").click();
  await page.locator("//html/body/div[2]/div[3]/div/div[2]/button[1]").click();
  await page.locator("//button[contains(text(), 'Continue to Components Installation')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
}

test.beforeEach(async () => {
  test.setTimeout(100000);
  await setupPage();
});

test.afterEach(async () => {
  await electronApp.close()
})

test('Test Skip Security is enable', async () => {
  page = await electronApp.firstWindow();
  const isButtonEnabled = await page.isEnabled(Skip_SecuritySelector);
  expect(isButtonEnabled).toBe(true);
})

test('Test Previous button is enable', async () => {
  page = await electronApp.firstWindow();
  const Prev_ButtonEnabled = await page.isEnabled(Previous_buttonSelector);
  expect(Prev_ButtonEnabled).toBe(true);
})

test('Test click Previous button', async () => {
  page = await electronApp.firstWindow();
  await page.locator(Previous_buttonSelector).click();
  await page.locator('span.MuiStepLabel-label:has-text("APF Authorize Load Libraries")');
  await page.waitForSelector(':has-text("APF Authorize Load Libraries")');
  const isApfTextVisible = await page.isVisible(':has-text("Certificates")');
  expect(isApfTextVisible).toBe(true);
})

test('Test click Skip Security', async () => {
  page = await electronApp.firstWindow();
  await page.locator(Skip_SecuritySelector).click();
  await page.locator('span.MuiStepLabel-label:has-text("Certificates")');
  await page.waitForSelector(':has-text("Certificates")');
  const isCertificatesTextVisible = await page.isVisible(':has-text("Certificates")');
  expect(isCertificatesTextVisible).toBe(true);
})

test('Test Continue to certificate setup disable', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  page = await electronApp.firstWindow()
  const isButtonDisabled = await page.isDisabled(Continue_CertificateSelector);
  expect(isButtonDisabled).toBe(true);
})

test('Test View Yaml should open Editor', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "View Yaml")]');
  const editorContainer = await page.waitForSelector(monacoEditor_Selector, { timeout: 5000 });
  expect(editorContainer).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test View/Submit Job job should open Editor', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "Preview Job")]');
  const editorContainer = await page.waitForSelector(monacoEditor_Selector, { timeout: 5000 });
  expect(editorContainer).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test View Job should open Editor', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "Submit Job")]');
  const editorContainer = await page.waitForSelector(monacoEditor_Selector, { timeout: 5000 });
  expect(editorContainer).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test all required fields', async () => {
  page = await electronApp.firstWindow();
  const Security_Product = await page.locator('input[role="combobox"]')
  const admin = await page.getByLabel('Admin');
  const stc = await page.getByLabel('Stc');
  const sys_prog = await page.getByLabel('Sys Prog');
  const user_zis = await page.locator(mainXpath +'/div/div/div[2]/div/div/input');
  const user_zowe = await page.locator(mainXpath +'/div/div/div[1]/div/div/input');
  const aux = await page.getByLabel('Aux');
  const stc_zowe = await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input');
  const stc_zis = await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input');
  await page.waitForTimeout(1000);
  expect(Security_Product).toBeTruthy();
  expect(admin).toBeTruthy();
  expect(stc).toBeTruthy();
  expect(sys_prog).toBeTruthy();
  expect(user_zis).toBeTruthy();
  expect(user_zowe).toBeTruthy();
  expect(aux).toBeTruthy();
  expect(stc_zowe).toBeTruthy();
  expect(stc_zis).toBeTruthy();
})

test('Test Save and close button', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('RACF');
  await page.getByLabel('Admin').fill(process.env.SECURITY_ADMIN);
  await page.getByLabel('Stc').fill(process.env.SECURITY_STC);
  await page.locator(Save_CloseSelector).click();
  page.click('#card-install')
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.click('button.MuiButton-root')
  await page.click(continueButtonSelector)
  await page.locator("//button[contains(text(), 'Continue to Installation Options')]").click();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'License Agreement')]").click();
  await page.locator("//html/body/div[2]/div[3]/div/div[2]/button[1]").click();
  await page.locator("//button[contains(text(), 'Continue to Components Installation')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
  const AdminText = await page.getByLabel('Admin').inputValue();
  const StcText = await page.getByLabel('Stc').inputValue();
  expect(AdminText).toBe(process.env.SECURITY_ADMIN);
  expect(StcText).toBe(process.env.SECURITY_STC);
});

test('Test Continue Certificate setup enable after intialization', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('RACF');
  await page.getByLabel('Admin').fill(process.env.SECURITY_ADMIN);
  await page.getByLabel('Stc').fill(process.env.SECURITY_STC);
  await page.getByLabel('Sys Prog').fill(process.env.SECURITY_SYSPROG);
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill(process.env.SECURITY_USER_ZIS);
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill(process.env.SECURITY_USER_ZOWE);
  await page.getByLabel('Aux').fill(process.env.SECURITY_AUX);
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill(process.env.SECURITY_STC_ZOWE);
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill(process.env.SECURITY_STC_ZIS);
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(true);
  const ButtonDisabled = await page.isEnabled(Continue_CertificateSelector);
  expect(ButtonDisabled).toBe(true);
});


test('Test Security RACF Product', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('RACF');
  await page.getByLabel('Admin').fill(process.env.SECURITY_ADMIN);
  await page.getByLabel('Stc').fill(process.env.SECURITY_STC);
  await page.getByLabel('Sys Prog').fill(process.env.SECURITY_SYSPROG);
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill(process.env.SECURITY_USER_ZIS);
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill(process.env.SECURITY_USER_ZOWE);
  await page.getByLabel('Aux').fill(process.env.SECURITY_AUX);
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill(process.env.SECURITY_STC_ZOWE);
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill(process.env.SECURITY_STC_ZIS);
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(true);
});


test('Test with all fields empty', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('');
  await page.getByLabel('Admin').fill('');
  await page.getByLabel('Stc').fill('');
  await page.getByLabel('Sys Prog').fill('');
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill('');
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill('');
  await page.getByLabel('Aux').fill('');
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill('');
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill('');
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(false);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(false);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(false);
});