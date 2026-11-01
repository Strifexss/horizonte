import React from 'react';

type Props = {
  title: string;
  mobileTitle?: string;
  subtitle?: string;
  showSubtitleOnMobile?: boolean;
  actions?: React.ReactNode;
};

export default function PageTitle({ title, mobileTitle, subtitle, showSubtitleOnMobile = false, actions }: Props) {
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
        {subtitle ? (
          <p className={`text-sm text-muted-foreground ${showSubtitleOnMobile ? 'block' : 'hidden md:block'}`}>{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-4 max-md:has-[>:not(.hidden)]:mt-4 md:gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
