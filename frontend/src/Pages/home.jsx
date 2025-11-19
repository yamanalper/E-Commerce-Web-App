import './landing.css';

export function Home() {
  return (
    <main>
      <section className="landingHero">
        <div className="heroCopy">
          <h1>Shop Smart. Live Better.</h1>
          <p>Discover curated products, transparent prices, and a smooth shopping experience built for speed and clarity.</p>
          <div className="heroActions">
            <a href="#/products" className="btnPrimary">Browse Products</a>
            <a href="#/register" className="btnGhost">Create Account</a>
          </div>
        </div>
        <div className="heroShowcase">
          {/* Placeholder showcase area; replace with carousel/featured items */}
          <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>Featured Collection</span>
        </div>
      </section>
      <section className="featureStrip">
        {[
          { t: 'Fast Checkout', d: 'Secure and streamlined purchasing—no clutter.' },
          { t: 'Real-Time Stock', d: 'Always up-to-date inventory visibility.' },
          { t: 'Personal Profiles', d: 'Manage orders, addresses, and preferences.' },
          { t: 'Responsive Design', d: 'Optimized for every device and theme.' }
        ].map(f => (
          <div key={f.t} className="featureCard">
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}