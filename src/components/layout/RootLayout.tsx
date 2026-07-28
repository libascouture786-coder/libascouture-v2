import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFloat } from './WhatsAppFloat';
import { MobileAppointmentBar } from './MobileAppointmentBar';

export function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <MobileAppointmentBar />
    </div>
  );
}
