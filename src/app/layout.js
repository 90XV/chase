import { Cal_Sans } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import OrderStatusButton from "@/components/OrderStatusButton";
import { CartProvider } from "@/lib/CartContext";
import { SupabaseProvider } from "@/lib/SupabaseContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const calSans = Cal_Sans({
  subsets: ["latin"],
  variable: "--font-cal-sans",
  weight: "400"
});

export const metadata = {
  title: "Chase",
  description: "Chase the Caffeine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${calSans.variable} ${calSans.className}`}>
        <ThemeProvider>
          <SupabaseProvider>
            <CartProvider>
              <Background />
              <Navigation />
              <main>{children}</main>
              <OrderStatusButton />
            </CartProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
