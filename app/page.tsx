import Link from "next/link"
import { Bus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 md:p-12 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary p-3 rounded-lg">
            <Bus className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transportation Service</h1>
        </div>

        <div className="space-y-4">
          <Link href="/client-request" className="block">
            <Button
              variant="outline"
              className="w-full py-6 text-lg font-medium border-2 hover:bg-accent hover:border-primary transition-all bg-transparent"
            >
              Client Request Forum
            </Button>
          </Link>

          <Link href="/staff-login" className="block">
            <Button
              variant="secondary"
              className="w-full py-6 text-lg font-medium hover:bg-secondary/80 transition-all"
            >
              Staff Sign in
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
