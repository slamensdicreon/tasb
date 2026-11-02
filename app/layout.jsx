import "./globals.css";
import "./portal.css";
import { PortalProvider } from "../components/PortalContext";
import Shell from "../components/Shell";
export const metadata = {
  title: {
    default: "Member Workspace | TASB Risk Management Fund",
    template: "%s | TASB Risk Management Fund",
  },
  description:
    "Interactive TASB member portal concept with illustrative district data.",
  icons: { icon: "/assets/favicon.svg" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PortalProvider>
          <Shell>{children}</Shell>
        </PortalProvider>
      </body>
    </html>
  );
}
