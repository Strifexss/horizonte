import React from 'react';

type Props = {
  amount: number;
  type: 'credit' | 'debit';
  formatter?: (v: number) => string;
};

export default function Amount({ amount, type, formatter }: Props) {
  const formatted = formatter ? formatter(amount) : String(amount);
  return <span className={type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatted}</span>;
}

