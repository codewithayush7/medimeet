import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// import {
//   Calendar,
//   CreditCard,
//   ShieldCheck,
//   Stethoscope,
//   User,
// } from "lucide-react";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
// import { checkUser } from "@/lib/checkUser";
// import { Badge } from "./ui/badge";
// import { checkAndAllocateCredits } from "@/actions/credits";

const Header = () => {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo-single.png"
            alt="Medimeet Logo"
            width={200}
            height={60}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton>
              <Button variant="secondary">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
