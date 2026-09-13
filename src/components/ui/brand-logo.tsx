import Image from "next/image";

/**
 * Renders the Tecno Team logo from the database (Admin -> Settings ->
 * Branding) wherever the brand mark appears. If no logo has been uploaded
 * yet, falls back to the original gold text wordmark so the site never
 * breaks or looks empty (spec: "do not break the website if the logo is
 * missing; use a graceful fallback").
 */
export function BrandLogo({
  logoUrl,
  textClassName = "font-display text-base font-semibold",
  imgClassName = "h-8 w-auto object-contain",
  alt = "Tecno Team",
}: {
  logoUrl?: string | null;
  textClassName?: string;
  imgClassName?: string;
  alt?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={alt}
        width={160}
        height={48}
        unoptimized
        className={imgClassName}
        priority
      />
    );
  }

  return (
    <span className={textClassName}>
      <span className="text-[var(--gold)]">Tecno</span> Team
    </span>
  );
}
