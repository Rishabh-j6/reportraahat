"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavLink {
    label: string;
    to: string;
    icon: string;
}

export function NavLinks({ links }: { links: NavLink[] }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-0.5">
            {links.map((link) => {
                const isActive = pathname === link.to;
                return (
                    <Link
                        key={link.to}
                        href={link.to}
                        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            color: isActive ? "#ffffff" : "rgba(255,255,255,0.38)",
                            background: isActive
                                ? "rgba(255,153,51,0.12)"
                                : "transparent",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)";
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                            }
                        }}
                    >
                        {/* Active left glow bar */}
                        {isActive && (
                            <motion.span
                                layoutId="nav-active-bar"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                style={{ background: "#FF9933", boxShadow: "0 0 8px #FF9933" }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}

                        {/* Icon */}
                        <span
                            className="text-base w-6 text-center flex-shrink-0 transition-transform duration-200"
                            style={{
                                filter: isActive ? "drop-shadow(0 0 4px rgba(255,153,51,0.5))" : "none",
                                transform: isActive ? "scale(1.1)" : "scale(1)",
                            }}
                        >
                            {link.icon}
                        </span>

                        <span className="truncate">{link.label}</span>

                        {/* Active dot */}
                        {isActive && (
                            <span
                                className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: "#FF9933", boxShadow: "0 0 6px #FF9933" }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
