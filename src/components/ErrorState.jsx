export default function ErrorState({ message, title = "Unable to load data" }) {
  return (
    <section className="alert-banner">
      <div className="icon-circle"><span className="material-symbols-outlined">cloud_off</span></div>
      <div>
        <div className="body-md" style={{ fontWeight: 700 }}>{title}</div>
        <div className="helper-text" style={{ color: "inherit", opacity: 0.9 }}>
          {message || "Could not reach the backend server."}
        </div>
      </div>
    </section>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <section className="card" style={{ textAlign: "center", padding: "var(--space-xl) var(--space-md)" }}>
      <span className="material-symbols-outlined pulse" style={{ fontSize: 32, color: "var(--outline)" }}>autorenew</span>
      <p className="helper-text" style={{ marginTop: 8 }}>{label}</p>
    </section>
  );
}
