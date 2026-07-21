import logoUrl from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  alt?: string;
}

export function Logo({ className = "", size = 32, showWordmark = true, alt = "AlmaPrivé" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain shrink-0"
      />
      {showWordmark && (
        <span className="text-brand-gradient font-semibold tracking-tight">AlmaPrivé</span>
      )}
    </span>
  );
}
