"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
          <CheckCircle className="h-8 w-8 text-secondary" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-serif">Check your email</h1>
        <p className="text-muted-foreground">
          We've sent a confirmation link to your email address. Please click it to activate your account.
        </p>
      </div>

      <div className="rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">
        <p>Once confirmed, you can sign in and start customizing your podcast preferences.</p>
      </div>

      <div className="pt-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
