/** Re-mounts on every navigation, which gives each page the same gentle fade-up. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
