'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Menu, LogOut, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Topbar({ companyName }: { companyName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-medium text-slate-700">{companyName}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="rounded-lg p-2 hover:bg-slate-100"
        aria-label="Sair"
      >
        <LogOut className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex bg-slate-900/40">
          <div className="h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Menu</span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <Sidebar />
            </div>
          </div>
          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
