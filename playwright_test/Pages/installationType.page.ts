import { Page,Locator } from '@playwright/test';

class InstallationTypePage{
  page: Page;
  pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
  }

  async getInstallationTypePageTitle(){
    return await this.pageTitle.textContent({ timeout: 2000 });
  }
}
  export default InstallationTypePage;
