import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const OAuth2SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const expiresIn = params.get("expiresIn");
    const username = params.get("username");
    const roles = params.get("roles");

    if (!token) {
      navigate("/login");
      return;
    }

    const authResponse = {
      token,
      refreshToken,
      expiresIn: expiresIn ? Number(expiresIn) : null,
      user: {
        username,
        roles: roles ? roles.split(",") : [],
      },
    };

    authService.saveAuth(authResponse);
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-10 text-center shadow-xl shadow-slate-950/20">
          <h1 className="text-2xl font-semibold">Finishing sign-in...</h1>
          <p className="mt-4 text-slate-400">Your Google login is almost complete. Please wait while we sign you in.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuth2SuccessPage;
