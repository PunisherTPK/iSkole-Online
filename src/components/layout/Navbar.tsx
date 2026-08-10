"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Notes",
    href: "/notes",
  },
  {
    name: "Question Bank",
    href: "/question-bank",
  },
  {
    name: "Mentor",
    href: "/mentor",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          href="/"
          className="navbar-brand"
          onClick={closeMobileMenu}
          aria-label="iSkole Home"
        >
          <Image
            src="/branding/iskole-logo.png"
            alt="iSkole"
            width={110}
            height={42}
            priority
            className="navbar-logo-image"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-search"
            aria-label="Search iSkole"
            title="Search"
          >
            <span className="search-icon">⌕</span>
            <span>Search</span>
          </button>

          <Link href="/login" className="navbar-login">
            Login
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="navbar-mobile-controls">
          <button
            type="button"
            className="mobile-search-button"
            aria-label="Search iSkole"
            title="Search"
          >
            ⌕
          </button>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`mobile-menu ${
          mobileMenuOpen ? "mobile-menu-open" : ""
        }`}
      >
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={closeMobileMenu}
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/login"
            className="mobile-login"
            onClick={closeMobileMenu}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}