import { Page,Locator } from '@playwright/test';

class TitlePage {
  page: Page;
  zoweInstallButton: Locator;
  zoweDryrunButton: Locator;
  resumeProgressButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.zoweInstallButton = page.locator('#card-install')
    this.zoweDryrunButton = page.locator('#card-configure')
    this.resumeProgressButton = page.locator("//button[text()='Resume Progress']")
  }

  async navigateToConnectionTab(){
    await this.zoweInstallButton.click({timeout: 9000})
  }
  
  async clickOnResumeProgress(){
    await this.resumeProgressButton.click({timeout: 3000})
  }

}

  export default TitlePage;