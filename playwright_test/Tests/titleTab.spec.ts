import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page';

let electronApp: ElectronApplication

test.describe('Home', () => {
    let titlePage: TitlePage;
  
    test.beforeEach(async ({ page }) => {
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      titlePage = new TitlePage(page);
      
    })
  
    test('Open HomePage and verify title', async ({ page }) => {
      // verify title
     // page = await electronApp.firstWindow()
      await expect(page).toHaveTitle('Zowe Enterprise Necessity');
    })

    test('Verify install buttons', async ({ page }) => {
      // verify title
      //page = await electronApp.firstWindow()
      await expect(titlePage.zoweInstallButton).toBeVisible()
      await expect(titlePage.zoweDryrunButton).toBeVisible()
    })
})