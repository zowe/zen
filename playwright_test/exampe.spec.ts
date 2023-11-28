const { test, expect } = require('@playwright/test')
import { ElectronApplication, Page, _electron as electron } from 'playwright'


let electronApp: ElectronApplication
let page: Page


test.beforeAll(async () => {
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

})

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