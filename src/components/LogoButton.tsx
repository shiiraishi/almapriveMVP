import { Link, useLocation } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";

interface LogoButtonProps {
  size?: number;
  className?: string;
  alt?: string;
  ariaLabel?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function LogoButton({
  size = 36,
  className = "",
  alt = "AlmaPrivé",
  ariaLabel = "Voltar para a página inicial",
  showWordmark = false,
  wordmarkClassName = "",
}: LogoButtonProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      to="/"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`inline-flex items-center cursor-pointer select-none transition-all duration-300 ease-out hover:opacity-85 hover:scale-[1.03] active:scale-[0.97] ${className}`}
    >
      <img
        src={logoUrl}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain shrink-0"
      />
      {showWordmark && (
        <span
          className={`ml-1 sm:ml-1.5 text-base sm:text-lg font-semibold tracking-tight text-brand-gradient whitespace-nowrap ${wordmarkClassName}`}
        >
          AlmaPrivé
        </span>
      )}
    </Link>
  );
}
