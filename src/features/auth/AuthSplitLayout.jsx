import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LOGIN_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDFGXmwK6LDJFHZcbr80Pd6Qk62S2Z2nOdgqzLsmJyYFpeOQmLB0TW5c-wOFcJeSYhgz_nZe2OE40sRfCrE1eMtD1_okn0M80Qxctaig3BF8Jurn1LxYbTVgKW6zx3RgWWGHZStZeu1tAuKg7oZmLF1WzpCdIp6ys3uh7iwtvRnTw3b-U6rv-2_pD0iJaPB6addld2HjxiwaHCaJn6DOA-20RkWLuQn6dH-TLKRWrTAVRJC-OAVOKgCwEdPwS3qTh7i68DZmt9Vu8o';

const REGISTER_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA67Hxho-TRcpH3BXCiuxUpf3r0OpxV4yLUdIBMXGkOVbBAiEIWLCjPek4pDgjOan8A_EZIanW0-9DGN4iPwFex25tEQbfzz8JnSEIOjbzgXelfbUT1KU2_ppdMhr3loU5wTUcSKCp7j1sBUm_j7nupz92Wg3ClGy9Uw8EdU9yLLC4HkWY107jHqsRWWqm5Km4xRxWAoA3DP5nchJMfYJArSe-XMbbzeBQ0ejxuvxG26P-KphiDHpWiVSlW_prhO4IO3s6eh_eJVX8';

/**
 * Split hero + form shell (Stitch: login_split_layout / register_split_layout, Echelon tokens).
 */
export function AuthSplitLayout({ variant = 'login', children }) {
  const { t } = useTranslation();
  const isLogin = variant === 'login';

  return (
    <main className="flex min-h-screen bg-surface text-on-surface antialiased">
      {/* Left — desktop only */}
      <section
        className={`relative hidden w-1/2 flex-col overflow-hidden bg-surface-container-lowest lg:flex ${
          isLogin ? 'justify-center' : 'justify-end p-12 xl:p-16'
        }`}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={isLogin ? LOGIN_HERO_IMG : REGISTER_HERO_IMG}
            alt=""
            className={`h-full w-full object-cover ${isLogin ? 'opacity-40 mix-blend-screen' : ''}`}
          />
          <div
            className={`absolute inset-0 opacity-80 ${
              isLogin
                ? 'bg-gradient-to-tr from-surface via-transparent to-surface-container-lowest'
                : 'bg-gradient-to-t from-background via-background/40 to-transparent'
            }`}
          />
        </div>

        <div
          className={`relative z-10 ${isLogin ? 'px-12 text-center xl:px-20' : 'max-w-lg text-start'}`}
        >
          {isLogin ? (
            <>
              <h1 className="mb-6 font-sans text-4xl font-extrabold leading-tight tracking-tighter text-on-surface xl:text-5xl">
                {t('authLoginHeroLine1')}
                <br />
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                  {t('authLoginHeroLine2')}
                </span>
              </h1>
              <p className="mx-auto max-w-md font-sans text-lg leading-relaxed text-on-surface-variant">
                {t('authLoginHeroBlurb')}
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 h-1 w-12 bg-primary" />
              <h1 className="mb-6 font-sans text-4xl font-extrabold leading-tight tracking-tighter text-on-surface md:text-5xl">
                {t('authRegisterHeroTitle')}
              </h1>
              <p className="max-w-sm font-sans text-lg leading-relaxed text-on-surface-variant">
                {t('authRegisterHeroBlurb')}
              </p>
            </>
          )}
        </div>

        {isLogin ? (
          <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
            <div className="flex gap-4">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-primary/20">
                <div className="h-full w-2/3 bg-primary" />
              </div>
              <div className="h-1 w-12 rounded-full bg-surface-variant" />
              <div className="h-1 w-12 rounded-full bg-surface-variant" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/40">
              System Ver. 4.2.0-Alpha
            </span>
          </div>
        ) : null}
      </section>

      {/* Right — form */}
      <section className="relative flex min-h-screen w-full flex-1 flex-col bg-surface-container-low lg:w-1/2">
        <nav className="absolute left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-8 lg:px-8">
          <div className="text-xl font-bold tracking-tighter text-indigo-100">{t('appName')}</div>
          <Link
            to="/"
            className="group flex items-center gap-2 text-sm font-medium tracking-tight text-indigo-400/70 transition-colors hover:text-indigo-100"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
            {t('backToSite')}
          </Link>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-28 lg:px-24">{children}</div>

        {isLogin ? (
          <footer className="flex flex-wrap justify-center gap-6 px-8 py-8 lg:gap-8">
            <a
              href="#"
              className="text-xs font-semibold uppercase tracking-widest text-indigo-500/60 transition-opacity hover:text-indigo-400"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs font-semibold uppercase tracking-widest text-indigo-500/60 transition-opacity hover:text-indigo-400"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs font-semibold uppercase tracking-widest text-indigo-500/60 transition-opacity hover:text-indigo-400"
            >
              Help Center
            </a>
          </footer>
        ) : (
          <div className="mt-auto px-8 py-6 text-center text-[10px] font-semibold uppercase tracking-widest text-indigo-500/40">
            © {new Date().getFullYear()} {t('appName')}. Quiet Premium Experience.
          </div>
        )}
      </section>
    </main>
  );
}
