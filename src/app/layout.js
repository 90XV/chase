import { Inter } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import OrderStatusButton from "@/components/OrderStatusButton";
import { CartProvider } from "@/lib/CartContext";
import { SupabaseProvider } from "@/lib/SupabaseContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Hotwheels Coffee",
  description: "Mobile first online coffee shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
