import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageTitle({ title, subtitle, actions }: Props) {
  return (
    <div className="mb-2 flex items-start justify-between  md:flex-row flex-col">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="sm:ml-4 flex items-center gap-2 md:gap-3 flex-wrap md:mt-0 mt-4">{actions}</div> : null}
    </div>
  );
}

