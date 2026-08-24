// The web preview uses the API's HTTP-only session cookie. Keeping the native
// bearer token out of browser storage avoids exposing it to JavaScript.
export const sessionStore = {
  get: async () => null,
  set: async (_token: string) => undefined,
  clear: async () => undefined,
};
