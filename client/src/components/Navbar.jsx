import { BarChart3, Moon, Sparkles, Sun } from "lucide-react";
import useTheme from "../hooks/useTheme.js";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-black/20 bg-chrome/95 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-brass-500/40 bg-invest-600 text-paper">
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-brass-600">FinScout</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-brass-500">Research Desk</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-sm border border-brass-500/40 bg-white/5 px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-brass-500 sm:flex">
            <Sparkles size={14} aria-hidden="true" />
            LangChain · Gemini
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-brass-500/40 text-brass-500 transition hover:bg-white/5"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>
    </header>
  );
}