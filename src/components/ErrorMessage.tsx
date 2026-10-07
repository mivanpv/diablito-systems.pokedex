import { ReactNode } from 'react';

export default function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-l-[6px] border-dex-accent bg-red-50 p-3 text-sm text-dex-accent-dark" role="alert">
      <span className="mr-2 font-display text-xs font-bold uppercase">Error</span>
      {children}
    </div>
  );
}
