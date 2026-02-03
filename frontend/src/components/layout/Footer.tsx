import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    {/* Brand */}
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">
                            <span className="footer__logo-text">LOVE</span>
                            <span className="footer__logo-badge">Beta</span>
                        </Link>
                        <p className="footer__tagline">
                            Create stunning interactive presentations in seconds.
                            No design skills needed.
                        </p>
                        <div className="footer__social">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="footer__column">
                        <h4 className="footer__heading">Product</h4>
                        <ul className="footer__links">
                            <li><Link to="/create">Create Dashboard</Link></li>
                            <li><Link to="/#pricing">Pricing</Link></li>
                            <li><a href="#">Changelog</a></li>
                            <li><a href="#">Roadmap</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer__column">
                        <h4 className="footer__heading">Resources</h4>
                        <ul className="footer__links">
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">Templates</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Community</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="footer__column">
                        <h4 className="footer__heading">Company</h4>
                        <ul className="footer__links">
                            <li><a href="#">About</a></li>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Terms</a></li>
                            <li><a href="mailto:hello@love-app.com"><Mail className="w-4 h-4" /> Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} LOVE Platform. All rights reserved.</p>
                    <p className="footer__powered">
                        Powered by <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
