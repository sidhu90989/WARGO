export function appName(): string {
  const name = (import.meta as any).env?.VITE_APP_NAME as string | undefined;
  return name && typeof name === 'string' ? name : 'WARGO';
}

export function appSubtitle(): string {
  const sub = (import.meta as any).env?.VITE_APP_SUBTITLE as string | undefined;
  return sub && typeof sub === 'string' ? sub : '';
}

export function companyName(): string {
  // Platform/company brand – currently unified as WARGO
  return 'WARGO';
}
