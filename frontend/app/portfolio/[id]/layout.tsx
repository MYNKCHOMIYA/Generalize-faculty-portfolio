export default function PublicPortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The root app/layout.tsx already provides <html> and <body>.
  // This layout only needs to pass children through — no extra shell needed.
  return <>{children}</>
}
