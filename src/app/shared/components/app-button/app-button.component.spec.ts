import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppButtonComponent } from './app-button.component';

@Component({
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    <app-button
      [variant]="variant"
      [type]="type"
      [disabled]="disabled"
      [data-testid]="'app-button'"
      (clicked)="onClicked($event)"
    >
      {{ label }}
    </app-button>
  `,
})
class TestHostComponent {
  variant: 'primary' | 'secondary' = 'primary';
  type: 'button' | 'submit' | 'reset' = 'button';
  disabled = false;
  label = 'Agregar';
  clickedCount = 0;

  onClicked(): void {
    this.clickedCount += 1;
  }
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
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
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

  it('emits clicked when enabled', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(fixture.componentInstance.clickedCount).toBe(1);
  });

  it('does not emit clicked when disabled', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const button = getButtonOrFail(fixture);
    expect(button.disabled).toBe(true);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(fixture.componentInstance.clickedCount).toBe(0);
  });
});
