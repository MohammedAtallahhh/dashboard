"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
    <header id="header" className="z-50">
      <nav>
        {links.map(({ path, name }) => (
          <Link
            key={name}
            href={path}
            className={`${pathname === path ? "is-active" : ""}`}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
