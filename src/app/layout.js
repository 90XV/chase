import { Averia_Libre } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import OrderStatusButton from "@/components/OrderStatusButton";
import { CartProvider } from "@/lib/CartContext";
import { SupabaseProvider } from "@/lib/SupabaseContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const averiaLibre = Averia_Libre({
  subsets: ["latin"],
  variable: "--font-averia-libre",
  weight: "400",
  style: "normal",
});

export const metadata = {
  title: "Chase",
  description: "Chase the Caffeine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${averiaLibre.variable} ${averiaLibre.className}`}>
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
