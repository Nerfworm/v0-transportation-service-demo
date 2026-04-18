"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MainSelectionPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(180deg, #eaf1fb 0%, #142850 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-full max-w-md text-center">
        {/* LOGO + TITLE */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
            <Image
              src="/HavenWayAppLogo.png"
              alt="HavenWay logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            HavenWay
          </h1>
        </div>

        {/* BUTTONS */}
        <div className="space-y-4">
          <Link href="/client-request" className="block">
            <Button
              variant="outline"
              className="w-full py-6 text-lg font-medium border-2 hover:bg-accent hover:border-primary transition-all bg-transparent"
            >
              Client Request Form
            </Button>
          </Link>

          <Link href="/staff-login" className="block">
            <Button
              variant="default"
              className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all border-2 border-blue-700"
            >
              Staff Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
