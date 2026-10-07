import { ReactNode } from 'react';

export default function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      {children}
    </div>
  );
}
