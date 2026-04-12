import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../app/store';
import { Button } from '../components/ui/Button';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

const navClass = ({ isActive }) =>
  cn(
    'rounded-lg px-1 pb-1 text-sm font-medium tracking-tight transition-colors',
    isActive
      ? 'border-b-2 border-primary text-primary'
      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
  );

export function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  const toggleLanguage = () => {
    const next = i18n.language?.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface">
          {t('appName')}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navClass} end>
            {t('home')}
          </NavLink>
          {token && (
            <>
              <NavLink to="/create" className={navClass}>
                {t('createPoll')}
              </NavLink>
              <NavLink to="/profile" className={navClass}>
                {t('profile')}
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  {t('adminDashboard')}
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container"
            aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container"
            aria-label={t('language')}
          >
            <Globe className="h-5 w-5" />
          </button>

          {user && (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/20"
            >
              {user?.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-surface-container-highest text-xs font-bold text-primary">
                  {(user.name || '?').slice(0, 1).toUpperCase()}
                </span>
              )}
            </button>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            {token ? (
              <Button variant="ghost" onClick={() => logout()}>
                {t('logout')}
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">{t('login')}</Button>
                </Link>
                <Link to="/register">
                  <Button>{t('register')}</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-outline-variant/10 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-on-surface">
              {t('home')}
            </Link>
            {token && (
              <>
                <Link to="/create" onClick={() => setOpen(false)}>
                  {t('createPoll')}
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  {t('profile')}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    {t('adminDashboard')}
                  </Link>
                )}
                <Button className="w-full" variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                  {t('logout')}
                </Button>
              </>
            )}
            {!token && (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  {t('login')}
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
