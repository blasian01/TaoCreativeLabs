'use client';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { AnimatedGrid } from '@/components/ui/AnimatedGrid';
export function SiteChrome({children}:{children:React.ReactNode}){
 const path=usePathname();
 if(path.startsWith('/admin')||path.startsWith('/auth/'))return <>{children}</>;
 return <><AnimatedGrid/><Navbar/><main className="min-h-screen">{children}</main><Footer/></>;
}
