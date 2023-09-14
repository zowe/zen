const { test, expect } = require('@playwright/test')
import { ElectronApplication, Page, _electron as electron } from 'playwright'


let electronApp: ElectronApplication
let page: Page


test('launch app and screenshot', async () => {
  const electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
  const window = await electronApp.firstWindow()
  await window.screenshot({ path: 'intro.png' })
  // close app
  await electronApp.close()
})
