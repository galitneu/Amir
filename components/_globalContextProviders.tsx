import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { AuthProvider } from "../helpers/useAuth";
import { NavigationMenu } from "./NavigationMenu";

import i18n from "../helpers/i18n";
import styles from "./_globalContextProviders.module.css";

const queryClient = new QueryClient();

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <TooltipProvider>
            <div className={styles.appLayout}>
              <NavigationMenu />
              <main className={styles.mainContent}>
                {children}
              </main>

            </div>
            <SonnerToaster />
          </TooltipProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};