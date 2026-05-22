import "./globals.css";

export const metadata = {
  title: "Gestión de Mantenimiento",
  description: "App de mantenimiento migrada a Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
