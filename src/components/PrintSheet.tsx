import type { ReactNode } from "react";

/**
 * Wrapper for one printable page.
 */

type Props = {
  title: string;
  children: ReactNode;
};

export default function PrintSheet({ title, children }: Props) {
  return (
    <main className="sheet">
      <div className="top-title">{title}</div>
      {children}
    </main>
  );
}