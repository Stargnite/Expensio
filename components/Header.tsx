"use client";

import { SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import { Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

function Header() {
  const pathName = usePathname();
  const isHomePage = pathName === "/";

  return (
    <div
      className={`p-4 flex items-center justify-between ${
        isHomePage ? "bg-red-50" : "bg-white border-b border-red-100"
      }`}
    >
      <Link href="/" className="flex items-center group">
        <Receipt className="w-6 h-6 text-red-600 mr-2 group-hover:text-red-700 transition-colors" />
        <h1 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">AcountaAI</h1>
      </Link>

      <div className="flex items-center space-x-4">
        <SignedIn>
          <Link href="/receipts">
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300">
              My Receipts
            </Button>
          </Link>

          <Link href="/manage-plan">
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
              Manage Plan
            </Button>
          </Link>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
              Login
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
    // <div
    //   className={`p-4 flex items-center justify-between ${
    //     isHomePage ? "bg-blue-50" : "bg-white border-b border-blue-50"
    //   }`}
    // >
    //   <Link href="/" className="flex items-center">
    //     <Shield className="w-6 h-6 text-blue-600 mr-2" />
    //     <h1 className="text-xl font-semibold">Expensio</h1>
    //   </Link>

    //   <div className="flex items-center space-x-4">
    //     <SignedIn>
    //       <Link href="/receipts">
    //         <Button variant="outline">My Receipts</Button>
    //       </Link>

    //       <Link href="/manage-plan">
    //         <Button>Manage Plan</Button>
    //       </Link>
    //       <UserButton />
    //     </SignedIn>

    //     <SignedOut>
    //       <SignInButton mode="modal">
    //         <Button>Login</Button>
    //       </SignInButton>
    //     </SignedOut>
    //   </div>
    // </div>
  );
}

export default Header;
