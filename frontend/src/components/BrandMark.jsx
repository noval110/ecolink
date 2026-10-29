export default function BrandMark({ size = 28, className = '' }) {
  return (
    <img
      src="/branding/ecolink-mark.png?v=leaf-link-1"
      className={`brand-logo-icon ${className}`.trim()}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
