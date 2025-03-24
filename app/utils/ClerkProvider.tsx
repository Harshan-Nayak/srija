import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function ClerkProviderComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
      afterSignInUrl="/(app)/home"
      afterSignUpUrl="/(app)/home"
    >
      {children}
    </ClerkProvider>
  );
} 