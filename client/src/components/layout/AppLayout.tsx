import type { ReactElement, ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="container flex-1 py-4 pb-20 sm:pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
