export default function LogoIcon({ className = "size-5", inverted = false }) {
  return (
    <img
      src={inverted ? "/logo-black.png" : "/logo-white.png"}
      alt="PALU Router Logo"
      className={`object-contain inline-block dark:invert-0 ${className}`}
    />
  );
}
