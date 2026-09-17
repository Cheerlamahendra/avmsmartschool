import './globals.css';
import { ReactNode } from 'react';
export const metadata = { title:'AVMSmart School | Quality Education for a Brighter Future', description:'AVMSmart School website and school management system demo' };
import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/Toast';
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><Providers><ToastProvider>{children}</ToastProvider></Providers></body></html>}
