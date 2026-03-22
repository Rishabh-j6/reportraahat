"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  to: string;
  icon: string; // material-symbols-outlined icon name
  isCenter?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Garage", to: "/", icon: "settings_input_component" },
  { label: "Stats", to: "/dashboard", icon: "leaderboard" },
  { label: "Race", to: "/exercise", icon: "sports_score", isCenter: true },
  { label: "Fuel", to: "/nutrition", icon: "local_gas_station" },
  { label: "Driver", to: "/avatar", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 rounded-t-[3rem]"
      style={{
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.4)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.to ||
          (item.to === "/dashboard" && pathname === "/dashboard") ||
          (item.to === "/exercise" && pathname === "/exercise") ||
          (item.to === "/nutrition" && pathname === "/nutrition") ||
          (item.to === "/avatar" && (pathname === "/avatar" || pathname === "/wellness"));

        if (item.isCenter) {
          return (
            <Link key={item.to} href={item.to}>
              <motion.div
                className="flex flex-col items-center justify-center text-white rounded-full p-3 -mt-6 nav-race-btn"
                whileTap={{ scale: 0.9 }}
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                <span className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest mt-1">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        }

        return (
          <Link
            key={item.to}
            href={item.to}
            className="flex flex-col items-center justify-center p-2 transition-colors duration-200"
            style={{
              color: isActive ? "#FB8C00" : "#94a3b8",
            }}
          >
            <span className="material-symbols-outlined text-xl">
              {item.icon}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest mt-1">
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="w-1 h-1 rounded-full mt-0.5"
                style={{ background: "#FB8C00" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Top Header Bar ──────────────────────────────────────────────────────
export function TopBar() {
  return (
    <header
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 rounded-b-[3rem]"
      style={{
        background: "rgba(15,23,42,0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.1)",
      }}
    >
      <Link href="/" className="text-2xl font-black italic tracking-tighter"
        style={{ color: "#FB8C00", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        VANGARD
      </Link>
      <div className="flex items-center gap-4">
        <button className="hover:scale-105 transition-transform active:scale-95"
          style={{ color: "#FB8C00" }}>
          <span className="material-symbols-outlined">military_tech</span>
        </button>
        <button className="hover:scale-105 transition-transform active:scale-95"
          style={{ color: "#FB8C00" }}>
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>
    </header>
  );
}

// Legacy export for backwards compat
export function NavLinks({ links }: { links: { label: string; to: string; icon: string }[] }) {
  return <BottomNav />;
}
