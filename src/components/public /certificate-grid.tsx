"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface CertificateItem {
  id: string;
  title: string;
  organization: string;
  issueDate: string;
  credentialId: string | null;
  credentialUrl: string | null;
  image: string | null;
  category: string;
  description: string | null;
}

export function CertificateGrid({ certificates }: { certificates: CertificateItem[] }) {
  const [active, setActive] = useState<CertificateItem | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <button
            key={cert.id}
            type="button"
            onClick={() => setActive(cert)}
            className="text-left rounded-[var(--radius-lg)] border border-[var(--border)] p-5 transition-colors hover:border-[var(--gold)]"
          >
            {cert.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cert.image}
                alt={cert.title}
                className="mb-4 h-32 w-full rounded-[var(--radius-md)] object-cover"
              />
            )}
            <p className="font-medium">{cert.title}</p>
            <p className="text-sm text-[var(--slate)]">{cert.organization}</p>
            <p className="mt-2 text-xs text-[var(--slate)] font-data">
              {new Date(cert.issueDate).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
          active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setActive(null)}
        aria-hidden={!active}
      >
        {active && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-lift)]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--gold-deep)]">{active.category}</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{active.title}</h2>
                <p className="text-sm text-[var(--slate)]">{active.organization}</p>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--slate)] hover:bg-[var(--border)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {active.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.image}
                alt={active.title}
                className="w-full rounded-[var(--radius-md)] object-contain"
              />
            )}

            <p className="mt-4 text-xs text-[var(--slate)] font-data">
              Issued {new Date(active.issueDate).toLocaleDateString()}
            </p>

            {active.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">{active.description}</p>
            )}

            {active.credentialId && (
              <p className="mt-3 text-xs text-[var(--slate)]">
                Credential ID: <span className="font-data">{active.credentialId}</span>
              </p>
            )}

            {active.credentialUrl && (
              
                href={active.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold-deep)]"
              >
                Verify credential <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
