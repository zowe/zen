import { ElectronApplication, _electron as electron, Page, launch } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;
//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium';
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required';
const greenCheckIconSelector = 'div svg.MuiSvgIcon-colorSuccess';

const runtime_dir = '/u/ts5223'
const extension_dir = '/u/ts5223/extension'
const log_dir = '/u/ts5223/log'
const job_name = 'ZWEMVDHP'
const job_prefix = 'ZWE'
const java_path = '/rsusr/java/IBM/J8.0_64.sr7fp11'
const node_path = '/proj/mvd/node/installs/node-v18.18.2-os390-s390x-202310180251'

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
  await page.getByLabel('Run-time Directory (or installation location)').fill(runtime_dir);
  await page.getByLabel('Workspace Directory').fill(process.env.ZOWE_WORKSPACE_DIR);
  await page.getByLabel('Extensions Directory').fill(extension_dir);
  await page.getByLabel('Log Directory').fill(log_dir);
  await page.getByLabel('Rbac Profile Identifier').fill('1');
  await page.getByLabel('Job Name').fill(job_name);
  await page.getByLabel('Job Prefix').fill(job_prefix);
  await page.getByLabel('Java location').fill(java_path);
  await page.getByLabel('Node.js location').fill(node_path);
  await page.getByLabel('z/OSMF Application Id').fill('IZUDFLT');
  await page.locator("//button[contains(text(), 'Validate locations')]").click();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'Continue to Installation Options')]").click();

  return electronApp;
}
