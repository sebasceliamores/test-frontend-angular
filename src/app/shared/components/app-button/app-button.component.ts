import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.scss'],
})
export class AppButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() link?: string | any[];
  @Input('data-testid') testId?: string;

  constructor(private readonly router: Router) {}

  handleClick(): void {
    if (this.disabled || !this.link) {
      return;
    }

    if (Array.isArray(this.link)) {
      this.router.navigate(this.link);
    } else {
      this.router.navigateByUrl(this.link);
    }
  }
}
