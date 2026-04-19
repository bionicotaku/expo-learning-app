export type ApiTokenGetter = () =>
  | Promise<string | null | undefined>
  | string
  | null
  | undefined;

let tokenGetter: ApiTokenGetter | null = null;

export function registerApiTokenGetter(getter: ApiTokenGetter) {
  tokenGetter = getter;
}

export function clearApiTokenGetter() {
  tokenGetter = null;
}

export async function getRegisteredApiToken(): Promise<string | null> {
  if (!tokenGetter) {
    return null;
  }

  const token = await tokenGetter();
  return token ?? null;
}
