import React from 'react';
import { Menu } from 'lucide-react';

export default function ActionsCell() {
  return (
    <div className="inline-flex items-center">
      <button className="rounded bg-amber-100 px-3 py-1 text-xs inline-flex items-center" disabled>
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}

