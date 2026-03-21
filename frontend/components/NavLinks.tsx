"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
    label: string;
    to: string;
    icon: string;
}

export function NavLinks({ links }: { links: NavLink[] }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1">
            {links.map((link) => {
                const isActive = pathname === link.to;
                return (
                    <Link
                        key={link.to}
                        href={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
              ${isActive ? "bg-[#0F172A] text-white" : "text-slate-400 hover:bg-[#0F172A] hover:text-white"}`}
                    >
                        <span className="text-xl">{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
