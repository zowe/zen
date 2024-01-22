import { ElectronApplication, _electron as electron, Page, launch } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;
//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium';
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required';
const greenCheckIconSelector = 'div svg.MuiSvgIcon-colorSuccess';


export async function setup(): Promise<ElectronApplication> {
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
  await page.waitForTimeout(2000);
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.waitForTimeout(1000);
  await page.click('button.MuiButton-root')
  await page.waitForTimeout(1000);
  await page.waitForSelector(greenCheckIconSelector);
  const isGreenCheckIconVisible = await page.isVisible(greenCheckIconSelector);
  await page.click(continueButtonSelector)
  await page.locator("//button[contains(text(), 'Save and validate')]").click();
  await page.waitForTimeout(5000);
  await page.getByLabel('Run-time Directory (or installation location)').fill(process.env.ZOWE_ROOT_DIR);
  await page.getByLabel('Workspace Directory').fill(process.env.ZOWE_WORKSPACE_DIR);
  await page.getByLabel('Extensions Directory').fill(process.env.ZOWE_EXTENSION_DIR);
  await page.getByLabel('Log Directory').fill(process.env.ZOWE_LOG_DIR);
  await page.getByLabel('Rbac Profile Identifier').fill('1');
  await page.getByLabel('Job Name').fill(process.env.JOB_NAME);
  await page.getByLabel('Job Prefix').fill(process.env.JOB_PREFIX);
  await page.getByLabel('Java location').fill(process.env.JAVA_HOME);
  await page.getByLabel('Node.js location').fill(process.env.NODE_HOME);
  await page.getByLabel('z/OSMF Application Id').fill(process.env.ZOSMF_APP_ID);
  await page.locator("//button[contains(text(), 'Validate locations')]").click();
  await page.waitForTimeout(2000);
  await page.locator("//button[contains(text(), 'Continue to Installation Options')]").click();

  return electronApp;
}