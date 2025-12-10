import { Page } from '@playwright/test';
import { NavBar } from './NavBar';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';
import { HomePage } from './HomePage';
// import other pages here as needed

export class PageFactory {
  constructor(public page: Page) {}

  private _nav?: NavBar;
  get nav(): NavBar {
    if (!this._nav) this._nav = new NavBar(this.page);
    return this._nav;
  }

  private _signIn?: SignInPage;
  get signIn(): SignInPage {
    if (!this._signIn) this._signIn = new SignInPage(this.page);
    return this._signIn;
  }

  private _signUp?: SignUpPage;
  get signUp(): SignUpPage {
    if (!this._signUp) this._signUp = new SignUpPage(this.page);
    return this._signUp;
  }

  private _home?: HomePage;
  get home(): HomePage {
    if (!this._home) this._home = new HomePage(this.page);
    return this._home;
  }

  // add lazy getters for other pages below as needed
}

export const createPages = (page: Page) => new PageFactory(page);
