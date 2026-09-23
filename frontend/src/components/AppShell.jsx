import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const linksByRole = {
    CANDIDATE: [
        ["Dashboard", "/candidate/dashboard"],
        ["Find jobs", "/jobs"],
        ["Applications", "/applications"],
        ["Saved jobs", "/saved-jobs"],
        ["Resume", "/candidate/resumes"],
        ["Career AI", "/ai"]
    ],
    RECRUITER: [
        ["Dashboard", "/recruiter/dashboard"],
        ["Company", "/recruiter/company"],
        ["Jobs", "/recruiter/jobs"],
        ["Post a job", "/recruiter/jobs/create"]
    ],
    ADMIN: [["Dashboard", "/admin/dashboard"]]
};

function AppShell({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-brand-cream text-brand-ink">
            <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
                <div className="mx-auto flex min-h-[72px] w-[min(1240px,calc(100%-48px))] items-center gap-7 max-[760px]:w-[min(calc(100%-32px),620px)] max-[760px]:min-h-16 max-[760px]:flex-wrap max-[760px]:justify-between max-[760px]:gap-0">
                    <NavLink className="inline-flex shrink-0 items-center gap-2.5 text-[17px] font-bold tracking-tight text-brand-ink hover:text-brand-ink" to="/" aria-label="CareerConnect home">
                        <span className="grid size-[34px] place-items-center rounded-[11px] bg-brand-red text-lg text-white" aria-hidden="true">C</span>
                        <span>CareerConnect<span className="text-brand-red"> AI</span></span>
                    </NavLink>

                    <button
                        className="hidden size-10 flex-col items-center justify-center gap-[5px] rounded-[9px] border border-brand-border bg-white max-[760px]:flex"
                        type="button"
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span className="h-0.5 w-[17px] rounded-sm bg-brand-ink" /><span className="h-0.5 w-[17px] rounded-sm bg-brand-ink" /><span className="h-0.5 w-[17px] rounded-sm bg-brand-ink" />
                    </button>

                    <nav className={`hidden flex-1 items-center justify-center gap-1 min-[761px]:flex${menuOpen ? " order-3 grid w-full grid-cols-2 border-t border-brand-border py-2 max-[760px]:basis-full max-[760px]:flex-none max-[760px]:grid min-[761px]:flex" : ""}`} aria-label="Main navigation">
                        {(linksByRole[user?.role] || []).map(([label, href]) => (
                            <NavLink
                                key={href}
                                to={href}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `rounded-[9px] px-2.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors hover:bg-brand-light-red hover:text-brand-red ${isActive ? "bg-brand-light-red text-brand-red" : "text-brand-muted"}`}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className={`hidden shrink-0 items-center gap-3 min-[761px]:flex${menuOpen ? " flex order-4 w-full justify-between border-t border-brand-border py-2 max-[760px]:flex min-[761px]:flex" : ""}`}>
                        <span className="max-w-[150px] truncate text-[13px] text-brand-muted">{user?.name || "Account"}</span>
                        <button className="rounded-[9px] border border-brand-border bg-white px-3 py-2 text-[13px] font-semibold text-brand-ink transition-colors hover:border-brand-red hover:text-brand-red" type="button" onClick={handleLogout}>Sign out</button>
                    </div>
                </div>
            </header>
            <main className="min-h-[calc(100vh-72px)] max-[760px]:min-h-[calc(100vh-64px)]">{children}</main>
        </div>
    );
}

export default AppShell;
