import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { usePageTransition } from '../hooks/usePageTransition';

export function RootLayout() {
  const pageRef = usePageTransition();
  const { pathname } = useLocation();
  const authShell = pathname === '/login' || pathname === '/register';

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {!authShell ? <Navbar /> : null}
      <main className="flex-1">
        <div ref={pageRef} className={authShell ? 'min-h-screen' : 'min-h-[60vh]'}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
