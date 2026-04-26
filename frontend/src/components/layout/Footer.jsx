import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FaArrowUp } from "react-icons/fa";

const moduleLinks = [
  { label: " Facilities", to: "/admin" },
  { label: " Bookings", to: "/bookings" },
  { label: " Tickets", to: "/tickets" },
  { label: " Notifications", to: "/notifications" },
  { label: " Authentication", to: "/login" },
];

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setEmail("");
    window.setTimeout(() => setIsSubscribed(false), 2800);
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <span className="text-xl">🎓 </span>
            <span className="text-lg font-bold">Smart Campus Hub</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            A complete operations platform for smart campuses, connecting facilities, bookings,
            incident tickets, and notifications.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-xs" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              aria-label="Instagram"
            >
              <FaInstagram className="text-xs" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="text-xs" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              aria-label="X"
            >
              <FaXTwitter className="text-xs" />
            </button>
          </div>

          <form onSubmit={handleSubscribe} className="mt-5">
            <label htmlFor="newsletter-email" className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">
              Newsletter
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white"
              >
                Subscribe
              </button>
            </div>
            {isSubscribed && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Thanks for subscribing.</p>
            )}
          </form>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-slate-600 transition hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Modules
          </h3>
          <ul className="mt-4 space-y-2">
            {moduleLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-slate-600 transition hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>ðŸ“ Colombo, Sri Lanka</li>
            <li>📧 support@smartcampushub.edu</li>
            <li>ðŸ“ž +94 11 234 5678</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Copyright Â© {year} Smart Campus Hub. All rights reserved.
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollTop}
          className="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transition hover:-translate-y-1"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;
