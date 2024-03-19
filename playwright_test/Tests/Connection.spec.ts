import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';

let electronApp: ElectronApplication

test.describe('ConnectionTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
  
    test.beforeEach(async ({ page }) => {
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      
    })
  
    test('Verify connection details', async ({ page }) => {
      // verify title
      titlePage.navigateToConnectionTab()
      connectionPage.fillConnectionDetails('rs22','21','csmvdqe','9jipigi')
      connectionPage.SubmitValidateCredential()
      await page.waitForTimeout(2000);
    })

})