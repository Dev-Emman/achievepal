type PlaceholderPageProps = {
  title: string
}

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      <p>This page is coming soon.</p>
    </div>
  )
}

export default PlaceholderPage