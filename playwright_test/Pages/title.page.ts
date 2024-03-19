import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class TitlePage {
  page: Page;
  zoweInstallButton: Locator;
  zoweDryrunButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.zoweInstallButton = page.locator('#card-install')
    this.zoweDryrunButton = page.locator('#card-configure')
    
  }
  async navigateToConnectionTab(){
    await this.zoweInstallButton.click({timeout: 9000})
  } }

  export default TitlePage;