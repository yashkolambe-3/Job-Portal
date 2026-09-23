import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CANDIDATE"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await register(formData);

            setSuccess("Registration successful. Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-brand-cream px-6 py-6 max-[760px]:px-4 max-[760px]:py-[18px] max-[400px]:px-3">
            <header className="mx-auto w-full max-w-[1180px]">
                <Link to="/" className="inline-flex items-center gap-[9px] text-[17px] font-bold text-brand-ink hover:text-brand-ink">
                    <span className="grid size-[34px] place-items-center rounded-[10px] bg-brand-red text-lg text-white" aria-hidden="true">C</span>
                    CareerConnect <span className="-ml-2 text-brand-red">AI</span>
                </Link>
            </header>
            <div className="mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-[1180px] grid-cols-[minmax(0,1fr)_minmax(360px,470px)] items-center gap-[clamp(36px,8vw,120px)] py-14 max-[760px]:min-h-0 max-[760px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:py-[38px]">
                <section className="max-w-[550px]">
                    <p className="mb-3.5 text-xs font-extrabold tracking-[.12em] text-brand-red">A BETTER WAY FORWARD</p>
                    <h1 className="mb-[18px] max-w-[540px] text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-1.8px] max-[760px]:max-w-[620px] max-[760px]:text-[clamp(34px,10vw,46px)]">Make your next career move with confidence.</h1>
                    <p className="max-w-[500px] text-[17px] text-brand-muted max-[760px]:text-[15px]">Create a candidate profile or set up a recruiter workspace to start connecting with the right people.</p>
                    <div className="mt-7 flex flex-wrap gap-[9px]">
                        <span className="rounded-full border border-brand-border bg-white/75 px-3 py-[9px] text-xs font-semibold text-brand-muted">One profile, clear next steps</span>
                        <span className="rounded-full border border-brand-border bg-white/75 px-3 py-[9px] text-xs font-semibold text-brand-muted">Applications in one place</span>
                        <span className="rounded-full border border-brand-border bg-white/75 px-3 py-[9px] text-xs font-semibold text-brand-muted">Recruiter verification built in</span>
                    </div>
                </section>
                <section className="rounded-[18px] border border-brand-border bg-white p-[34px] shadow-[0_8px_30px_rgba(15,23,42,.06)] max-[760px]:p-6 max-[400px]:p-4">
                    <p className="mb-3.5 text-xs font-extrabold tracking-[.12em] text-brand-red">GET STARTED</p>
                    <h2 className="mb-2 text-[27px] tracking-tight">Create your account</h2>
                    <p className="mb-6 text-sm text-brand-muted">It takes a minute to set up your workspace.</p>
                    {error && <p className="rounded-[9px] border border-[#f4c7c3] bg-[#fff0ef] px-[13px] py-[11px] text-[13px] text-brand-dark-red" role="alert">{error}</p>}
                    {success && <p className="rounded-[9px] border border-[#cce5d2] bg-[#eff8f1] px-[13px] py-[11px] text-[13px] text-[#166534]" role="status">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="my-4 grid gap-[7px]">
                            <label className="text-[13px] font-semibold text-brand-ink" htmlFor="register-name">Full name</label>
                            <input className="min-h-[46px] w-full rounded-[9px] border border-brand-border-dark bg-white px-3 py-2 focus:border-brand-red focus:outline-3 focus:outline-brand-red/15" id="register-name" type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Your name" required maxLength={100} />
                        </div>
                        <div className="my-4 grid gap-[7px]">
                            <label className="text-[13px] font-semibold text-brand-ink" htmlFor="register-email">Email address</label>
                            <input className="min-h-[46px] w-full rounded-[9px] border border-brand-border-dark bg-white px-3 py-2 focus:border-brand-red focus:outline-3 focus:outline-brand-red/15" id="register-email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                        </div>
                        <div className="my-4 grid gap-[7px]">
                            <label className="text-[13px] font-semibold text-brand-ink" htmlFor="register-password">Password</label>
                            <input className="min-h-[46px] w-full rounded-[9px] border border-brand-border-dark bg-white px-3 py-2 focus:border-brand-red focus:outline-3 focus:outline-brand-red/15" id="register-password" type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" minLength={8} required />
                        </div>
                        <div className="my-4 grid gap-[7px]">
                            <label className="text-[13px] font-semibold text-brand-ink" htmlFor="register-role">I’m joining as</label>
                            <select className="min-h-[46px] w-full rounded-[9px] border border-brand-border-dark bg-white px-3 py-2 focus:border-brand-red focus:outline-3 focus:outline-brand-red/15" id="register-role" name="role" value={formData.role} onChange={handleChange}>
                                <option value="CANDIDATE">Candidate</option>
                                <option value="RECRUITER">Recruiter</option>
                            </select>
                        </div>
                        <button className="mt-2 min-h-[47px] w-full rounded-[9px] bg-brand-red font-bold text-white transition-colors hover:bg-brand-dark-red disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
                            {loading ? "Creating account…" : "Create account"}
                        </button>
                    </form>
                    <p className="mt-[21px] text-center text-[13px] text-brand-muted">Already have an account? <Link className="font-bold" to="/login">Sign in</Link></p>
                </section>
            </div>
        </main>
    );
}

export default Register;
