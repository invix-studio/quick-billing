import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

interface AppLayoutProps {
  children: ReactNode;
  businessName?: string;
}

export default function AppLayout({ children, businessName }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader businessName={businessName} />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-0 h-screen">
            <Sidebar businessName={businessName} />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="h-full pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}