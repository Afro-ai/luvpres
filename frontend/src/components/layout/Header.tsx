import { Link } from 'react-router-dom';

interface HeaderProps {
  transparent?: boolean; // For hero overlay
}

export function Header({ transparent = false }: HeaderProps) {
  return (
    <header className={`header ${transparent ? 'header--transparent' : ''}`}>
      <nav className="header__nav">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">LOVE</span>
          <span className="header__logo-badge">beta</span>
        </Link>
        
        <div className="header__links">
          <a href="#pricing">Pricing</a>
          <a href="#examples">Examples</a>
          <Link to="/login" className="btn btn--ghost">Log in</Link>
          <Link to="/create" className="btn btn--primary">Create Free</Link>
        </div>
      </nav>
    </header>
  );
}
