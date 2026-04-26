import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { authService } from "../services/authService";

const getInitialForm = () => ({
  username: "",
  password: "",
  email: "",
  firstName: "",
  lastName: "",
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(getInitialForm());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      navigate("/notifications");
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await authService.login({
          username: form.username.trim(),
          password: form.password,
        });
        setSuccess("Welcome back — you are now logged in.");
      } else {
        await authService.register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        });
        setSuccess("Account created. You are now signed in.");
      }

      navigate("/notifications");
    } catch (submissionError) {
      setError(submissionError.message || "Failed to complete authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setMode((previous) => (previous === "login" ? "register" : "login"));
    setError("");
    setSuccess("");
    setForm(getInitialForm());
  };

  const loginLabel = mode === "login" ? "Sign in to Smart Campus" : "Create a new account";

  return (
    <div className="bg-slate-100 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.95fr_0.7fr]">
          <div>
            <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-100">
              Authentication & Roles
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {loginLabel}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Secure login and registration flow for students, staff, and administrators. Use credentials to access notifications, bookings, and campus resources safely.
            </p>
            <div className="mt-8 space-y-4 rounded-3xl bg-slate-50 p-6 text-sm leading-6 text-slate-600 shadow-sm dark:bg-slate-950/60 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Login / registration features included:</p>
              <ul className="space-y-2 pl-4 text-slate-700 dark:text-slate-300">
                <li className="list-disc">Username/password login</li>
                <li className="list-disc">Registration with email</li>
                <li className="list-disc">Role-aware authorization support</li>
                <li className="list-disc">Secure token storage for authenticated navigation</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-950/95 p-8 text-white shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">{mode === "login" ? "Sign in" : "Register"}</p>
                <h2 className="mt-2 text-2xl font-semibold">Secure campus access</h2>
              </div>
              <button
                type="button"
                onClick={handleToggleMode}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
              >
                {mode === "login" ? "Create account" : "Go to login"}
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Enter your username"
                />
              </div>

              {mode === "register" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">First name</label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">Last name</label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Enter your password"
                />
              </div>

              {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{error}</p>}
              {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Working..." : mode === "login" ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-800/50 pt-6 text-center text-slate-400">
              <p className="text-sm">Or continue with your campus identity provider</p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "http://localhost:8081/oauth2/authorize/google";
                }}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/15"
              >
                <FaGoogle /> Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>Already part of the campus community? Use your credentials to unlock the system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
