import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageTitle({ title, subtitle, actions }: Props) {
  return (
    <div className="mb-2 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {actions ? <div className="ml-4 flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

