"use client";

import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function UserCreditsBadge({ user }) {
  if (!user || user?.role === "PATIENT") {
    return (
      <Link href="/pricing">
        <Badge variant="outline" className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2">
          <CreditCard className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">
            {user ? (
              <>
                {user.credits} <span className="hidden md:inline">Credits</span>
              </>
            ) : (
              <>Pricing</>
            )}
          </span>
        </Badge>
      </Link>
    );
  }

  return null;
}
