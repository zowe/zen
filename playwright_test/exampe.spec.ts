const { test, expect } = require('@playwright/test')
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import { spawn } from 'child_process';
import path from 'path';

let electronApp: ElectronApplication
let page: Page


test.beforeAll(async () => {
  const createDirsScriptPath = path.resolve(__dirname, './prepare.js');
  console.log('Creating child process with command:', 'node', [createDirsScriptPath]);
  const child = spawn('node', [createDirsScriptPath]);
  if (!child) {
    console.error('Failed to spawn child process');
    return;
  }
  console.log('Child process created successfully');
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  child.on('error', (error) => {
    console.error('Child process encountered an error:', error);
  });
  await new Promise(resolve => setTimeout(resolve, 3000));
  electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
  electronApp.on('window', async (page) => {
    const filename = page.url()?.split('/').pop()
    console.log(`Window opened: ${filename}`)
    page.on('pageerror', (error) => {
      console.error(error)
    })
    page.on('console', (msg) => {
      console.log(msg.text())
    })
  })
});



test.afterAll(async () => {
  await electronApp.close()
})

test('Test Title', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  const title = await page.title();
  expect(title).toBe("Zowe Enterprise Necessity");
})


test('Test Zowe Installation Button Exist', async () => {
  const window = await electronApp.firstWindow()
  await window.waitForTimeout(2000);
  const button = await window.$('#card-install');
  expect(button).toBeTruthy();
})

test('Test Dry Run Button Exist', async () => {
  const window = await electronApp.firstWindow()
  await window.waitForTimeout(2000);
  const button = await window.$('#card-configure');
  expect(button).toBeTruthy();
})


test('Test Click Zowe Installation', async () => {
  page = await electronApp.firstWindow()
  page.click('#card-install')
  const newPage = await electronApp.waitForEvent('window')
  expect(newPage).toBeTruthy()
  page = newPage
})


test(`example test`, async ({ page }) => {
  page = await electronApp.firstWindow()
  page.click('#card-install')
  await page.getByLabel('User Name').fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
});