export default function ExternalLink({ href, children, ...props }) {
  return (
    <a {...props} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
