import * as SecureStore from "expo-secure-store";
const KEY = "tradie-assistant-session";
export const sessionStore = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
