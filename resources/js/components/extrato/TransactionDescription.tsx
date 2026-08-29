import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Props = {
  description: string;
  type: 'credit' | 'debit';
  docType?: string;
  document?: string;
};

export default function TransactionDescription({ description, type, docType, document }: Props) {
  return (
    <div className="flex items-start gap-3">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {type === 'credit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      </span>
      <div>
        <div className="font-medium text-dark">{description}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Origem: {docType || '—'}{document ? <span className="ml-2">• {document}</span> : null}
        </div>
      </div>
    </div>
  );
}

