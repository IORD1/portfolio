import type { Metadata } from "next";
import "./globals.css";
import Scrollbar from "./scrollbar";

export const metadata: Metadata = {
  title: "Prathmesh Ingole — Engineer",
  description:
    "Software engineer building the next big surety platform at SuretyNow. Design. Architect. Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Scrollbar />
        {children}
      </body>
    </html>
  );
}
