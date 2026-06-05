import './globals.css';

export const metadata = {
  title: 'EVENTO - Event Company Management SaaS Platform',
  description: 'Manage photography studios, media agencies, videography, wedding planners, schedules, and billing in one unified interface.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#020617] text-white selection:bg-violet-500/30">
        {children}
      </body>
    </html>
  );
}
