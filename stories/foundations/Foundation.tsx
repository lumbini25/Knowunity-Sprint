/**
 * Shared layout for the foundation pages. No stories of its own -- it is
 * exercised through Colors, Typography, Spacing and Radius.
 */
import type { ReactNode } from 'react';
import { NO_DESCRIPTION, type Token } from './tokens';
import './foundations.css';

export function Page({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="fnd">
      <header className="fnd-head">
        <h1 className="fnd-title">{title}</h1>
        <p className="fnd-intro">{intro}</p>
      </header>
      {children}
    </div>
  );
}

/**
 * One layer of the system. The token file has two: primitives hold the raw
 * values, semantics alias into them and are what components consume.
 * A page shows both so the chain is visible end to end.
 */
export function Layer({
  name,
  note,
  children,
}: {
  name: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="fnd-layer">
      <h2 className="fnd-layer-name">{name}</h2>
      <p className="fnd-layer-note">{note}</p>
      {children}
    </section>
  );
}

export function Group({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="fnd-group">
      <h3 className="fnd-group-name">{name}</h3>
      <div className="fnd-rows">{children}</div>
    </section>
  );
}

/** A token with no visual of its own -- a raw number, family name or weight. */
export function PlainRow({ children }: { children: ReactNode }) {
  return <div className="fnd-row-plain">{children}</div>;
}

/**
 * The token's name, its resolved value, and its description. A token with no
 * $description says so rather than rendering an empty line.
 */
export function Meta({ token, value }: { token: Token; value: string }) {
  return (
    <div className="fnd-meta">
      <code className="fnd-name">{token.name}</code>
      <span className="fnd-value">
        {value || '—'}
        {token.alias ? <span className="fnd-alias"> &larr; {token.alias}</span> : null}
      </span>
      {token.description ? (
        <span className="fnd-desc">{token.description}</span>
      ) : (
        <span className="fnd-desc fnd-desc-missing">{NO_DESCRIPTION}</span>
      )}
    </div>
  );
}
