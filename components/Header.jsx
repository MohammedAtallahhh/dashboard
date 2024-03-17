"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    path: "/",
    name: "US Liquidity",
  },
  {
    path: "/global-liquidity",
    name: "Global Liquidity",
  },
  {
    path: "/crypto",
    name: "Crypto",
  },
];

const Header = () => {
  const pathname = usePathname();

  return (
    <header
      id="header"
      className="fixed top-0 left-0 py-5 w-full bg-surface-1 z-50"
    >
      <nav className="h-full flex flex-wrap items-center gap-1 max-w-7xl mx-auto px-10">
        {links.map(({ path, name }) => (
          <Link
            key={name}
            href={path}
            className={`p-2 hover:text-text active:text-text ${
              pathname === path ? "text-text" : "text-text-light"
            }`}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
