
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className="bg-blue-300"
        >
          <div className="flex">
            <div className="flex-auto">
              {children}
            </div>
          </div>
        </body>
    </html>
  );
}
