import { OAuthProviderInterface, OAuthProviderType } from "./OAuthProvider";
import { CombiniOAuthProvider } from "./CombiniOAuthProvider";

export function getOAuthProvider(
  providerName: OAuthProviderType,
  redirectUri: string
): OAuthProviderInterface {
  switch (providerName) {
    case "combini":
      return new CombiniOAuthProvider(redirectUri);
    // add more providers here
  }
}
