import { NgDeckPage } from './app.po';

describe('ng-deck App', () => {
  let page: NgDeckPage;

  beforeEach(() => {
    page = new NgDeckPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
