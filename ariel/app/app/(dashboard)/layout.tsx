'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/inbox', label: 'Inbox', icon: '💬' },
  { href: '/contacts', label: 'Contatos', icon: '👥' },
  { href: '/kanban', label: 'Funil', icon: '🎯' },
  { href: '/tasks', label: 'Tarefas', icon: '✅' },
  { href: '/calendar', label: 'Compliance', icon: '📅' },
  { href: '/reports', label: 'Relatórios', icon: '📊' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">🧜‍♀️ ARIEL</h1>
          <p className="text-xs text-gray-500 mt-1">Accounting</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Escritório Demo</p>
              <p className="text-xs text-gray-500">Professional</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
