'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-300"
      aria-label="Sair"
      title="Sair"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
