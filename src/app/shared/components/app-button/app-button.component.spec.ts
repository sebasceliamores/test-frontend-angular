import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { jest } from '@jest/globals';

import { AppButtonComponent } from './app-button.component';

@Component({
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <app-button
      [variant]="variant"
      [type]="type"
      [disabled]="disabled"
      [link]="link"
      [data-testid]="'app-button'"
    >
      {{ label }}
    </app-button>
  `,
})
class TestHostComponent {
  variant: 'primary' | 'secondary' = 'primary';
  type: 'button' | 'submit' | 'reset' = 'button';
  disabled = false;
  link?: string | any[];
  label = 'Agregar';
}

describe('AppButtonComponent', () => {
  const getButton = (fixture: { nativeElement: HTMLElement }) =>
    fixture.nativeElement.querySelector(
      'button[data-testid="app-button"]',
    ) as HTMLButtonElement | null;
  const getButtonOrFail = (fixture: { nativeElement: HTMLElement }) => {
    const button = getButton(fixture);
    expect(button).not.toBeNull();
    return button as HTMLButtonElement;
  };
  const clickButton = (button: HTMLButtonElement) => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders projected content and type', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    expect(button?.textContent).toContain('Agregar');
    expect(button?.type).toBe('button');
  });

  it('applies primary by default and secondary when set', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    expect(button.classList.contains('app-button--primary')).toBe(true);

    fixture.componentInstance.variant = 'secondary';
    fixture.detectChanges();
    const updatedButton = getButtonOrFail(fixture);
    expect(updatedButton.classList.contains('app-button--secondary')).toBe(true);
  });

  it('navigates using navigateByUrl when link is a string', () => {
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
    const navigateSpy = jest.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.link = '/products/new';
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    clickButton(button);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/products/new');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('navigates using navigate when link is an array', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.link = ['/products', 'p1', 'edit'];
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    clickButton(button);

    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'p1', 'edit']);
  });

  it('does not navigate when link is undefined', () => {
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
    const navigateSpy = jest.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    clickButton(button);

    expect(navigateByUrlSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not navigate when disabled', () => {
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
    const navigateSpy = jest.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.link = '/products/new';
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    expect(button.disabled).toBe(true);
    clickButton(button);

    expect(navigateByUrlSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
