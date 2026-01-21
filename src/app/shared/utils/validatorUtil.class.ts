export class ValidatorUtil {
  public static withCount(template: string, error: unknown): string {
    const requiredLength =
      (error as { requiredLength?: number })?.requiredLength ?? 0;
    return template.replace('{{count}}', String(requiredLength));
  }
}
