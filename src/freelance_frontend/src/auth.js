import { AuthClient } from "@dfinity/auth-client";

let authClient = null;

export const initAuth = async () => {
  authClient = await AuthClient.create();
};

export const login = async (setUser) => {
  await authClient.login({
    identityProvider: "https://identity.ic0.app",
    onSuccess: async () => {
      const identity = authClient.getIdentity();
      setUser(identity);
    },
    onError: (err) => {
      console.error("Login failed:", err);
    },
  });
};

export const logout = async (setUser) => {
  await authClient.logout();
  setUser(null);
};
