import { forwardRef, ReactNode } from 'react';

interface SectionPanelProps {
  title: string;
  /** Small status text on the right of the title row. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bordered section card with a title and a dashed divider. */
const SectionPanel = forwardRef<HTMLElement, SectionPanelProps>(function SectionPanel(
  { title, aside, children, className = '' },
  ref
) {
  return (
    <section ref={ref} className={`dex-section flex scroll-mt-4 flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-dex-line pb-3">
        <h2 className="dex-title">{title}</h2>
        {aside && <div className="shrink-0 font-display text-[11px] text-dex-muted">{aside}</div>}
      </div>
      {children}
    </section>
  );
});

export default SectionPanel;
