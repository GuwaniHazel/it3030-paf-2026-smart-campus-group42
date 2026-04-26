import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaChevronDown,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaTimes,
} from "react-icons/fa";

const modules = [
  { label: " Facilities & Assets Catalogue", to: "/admin" },
  { label: " Booking Management", to: "/bookings" },
  { label: " Incident Tickets", to: "/tickets" },
  { label: " Notifications", to: "/notifications" },
  { label: " Authentication", to: "/login" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem("smartCampusTheme");
      const dark = storedTheme === "dark";
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // Ignore theme read issues.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("smartCampusTheme", isDarkMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDarkMode);
    } catch {
      // Ignore theme save issues.
    }
  }, [isDarkMode]);

  useEffect(() => {
    setMobileOpen(false);
    setModuleOpen(false);
  }, [location.pathname]);

  let isLoggedIn = false;
  try {
    isLoggedIn = Boolean(window.localStorage.getItem("token"));
  } catch {
    isLoggedIn = false;
  }

  const handleAuthClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      window.localStorage.removeItem("token");
    } catch {
      // Ignore storage write issues.
    }

    navigate("/login");
  };

  const desktopLinkClass =
    "rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-400";

  const mobileLinkClass =
    "block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-400";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span className="text-xl">🎓 </span>
          <span className="text-base font-bold sm:text-lg">Smart Campus Hub</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link to="/" className={desktopLinkClass}>
            Home
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setModuleOpen((previous) => !previous)}
              className={`${desktopLinkClass} inline-flex items-center gap-2`}
            >
              Modules
              <FaChevronDown className={`text-xs transition ${moduleOpen ? "rotate-180" : ""}`} />
            </button>

            {moduleOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {modules.map((module) => (
                  <Link
                    key={module.to}
                    to={module.to}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                  >
                    {module.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          
          <Link to="/about" className={desktopLinkClass}>
            About
          </Link>
          <Link to="/contact" className={desktopLinkClass}>
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode((previous) => !previous)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            type="button"
            onClick={handleAuthClick}
            className="hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex sm:items-center sm:gap-2"
          >
            {isLoggedIn ? <FaSignOutAlt className="text-xs" /> : null}
            {isLoggedIn ? "Logout" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((previous) => !previous)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
          <div className="space-y-1">
            <Link to="/" className={mobileLinkClass}>
              Home
            </Link>

            <div className="rounded-md border border-slate-200 p-2 dark:border-slate-700">
              <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Modules
              </p>
              {modules.map((module) => (
                <Link key={module.to} to={module.to} className={mobileLinkClass}>
                  {module.label}
                </Link>
              ))}
            </div>

            <Link to="/admin" className={mobileLinkClass}>
              Admin
            </Link>
            <Link to="/student" className={mobileLinkClass}>
              Student
            </Link>
            <Link to="/about" className={mobileLinkClass}>
              About
            </Link>
            <Link to="/contact" className={mobileLinkClass}>
              Contact
            </Link>

            <button
              type="button"
              onClick={handleAuthClick}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
