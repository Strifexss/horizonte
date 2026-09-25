import React from 'react';

type Props = {
  title: string;
  mobileTitle?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageTitle({ title, mobileTitle, subtitle, actions }: Props) {
  return (
    <div className="mb-2 flex min-w-0 flex-col items-start justify-between md:flex-row">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">
          {mobileTitle ? (
            <>
              <span className="md:hidden">{mobileTitle}</span>
              <span className="hidden md:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle ? <p className="hidden text-sm text-muted-foreground md:block">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="mt-4 hidden flex-wrap items-center gap-2 sm:ml-4 md:mt-0 md:flex md:gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
