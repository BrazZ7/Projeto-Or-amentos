'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Menu, LogOut, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Topbar({ companyName }: { companyName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-lg lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 transition-colors hover:bg-slate-900/5"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-700">{companyName}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="rounded-lg p-2 transition-colors hover:bg-slate-900/5"
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex animate-fade-in">
          <div className="glass-solid h-full w-72 animate-scale-in overflow-y-auto rounded-none p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-slate-900/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <Sidebar />
            </div>
          </div>
          <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
