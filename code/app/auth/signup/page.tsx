"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Podcast, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  type PasswordValidationResult,
} from "@/lib/password-validation"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const router = useRouter()

  // Validate password in real-time
  const passwordValidation = useMemo<PasswordValidationResult>(() => {
    if (!formData.password) {
      return {
        isValid: false,
        strength: "weak",
        score: 0,
        errors: [],
        requirements: {
          minLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumber: false,
          hasSpecialChar: false,
          notCommon: false,
          notSequential: false,
        },
      }
    }
    return validatePassword(formData.password)
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError(
        passwordValidation.errors.length > 0
          ? passwordValidation.errors[0]
          : "Password does not meet security requirements. Please check the requirements below."
      )
      setLoading(false)
      setShowPasswordRequirements(true)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) {
        // Handle specific Supabase error cases
        const errorMessage = signUpError.message?.toLowerCase() || ""
        const errorStatus = signUpError.status || ""
        
        // Check for duplicate email errors (various formats Supabase might use)
        if (
          errorMessage.includes("already registered") ||
          errorMessage.includes("user already registered") ||
          errorMessage.includes("email address is already") ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("duplicate") ||
          errorStatus === 422 // Unprocessable Entity - often used for duplicates
        ) {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (errorMessage.includes("password") || errorMessage.includes("weak")) {
          setError("Password is too weak. Please use a stronger password (at least 6 characters).")
        } else if (errorMessage.includes("invalid email") || errorMessage.includes("email format")) {
          setError("Please enter a valid email address.")
        } else {
          // Show the actual error message from Supabase, or a generic one
          setError(signUpError.message || "Failed to create account. Please try again.")
        }
        return
      }

      // Success - redirect to success page
      router.push("/auth/sign-up-success")
    } catch (err) {
      // Fallback error handling
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Podcast className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-serif">Create your account</h1>
        <p className="text-muted-foreground">Join thousands getting their daily news podcast</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => {
              handleChange(e)
              setShowPasswordRequirements(true)
            }}
            onFocus={() => setShowPasswordRequirements(true)}
            required
            className={`w-full rounded-lg border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              formData.password && !passwordValidation.isValid
                ? "border-destructive focus:ring-destructive"
                : formData.password && passwordValidation.isValid
                  ? "border-green-500 focus:ring-green-500"
                  : "border-input focus:ring-accent bg-card"
            }`}
            placeholder="Create a strong password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password strength:</span>
                <span
                  className={`font-medium ${
                    passwordValidation.strength === "weak"
                      ? "text-red-500"
                      : passwordValidation.strength === "fair"
                        ? "text-orange-500"
                        : passwordValidation.strength === "good"
                          ? "text-yellow-500"
                          : "text-green-500"
                  }`}
                >
                  {getPasswordStrengthText(passwordValidation.strength)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                    passwordValidation.strength
                  )}`}
                  style={{ width: `${passwordValidation.score}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          {showPasswordRequirements && formData.password && (
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="font-medium text-foreground mb-2">Requirements:</div>
              <RequirementItem
                met={passwordValidation.requirements.minLength}
                text="At least 8 characters long"
              />
              <RequirementItem
                met={passwordValidation.requirements.hasUpperCase}
                text="Contains uppercase letter (A-Z)"
              />
              <RequirementItem
                met={passwordValidation.requirements.hasLowerCase}
                text="Contains lowercase letter (a-z)"
              />
              <RequirementItem
                met={passwordValidation.requirements.hasNumber}
                text="Contains number (0-9)"
              />
              <RequirementItem
                met={passwordValidation.requirements.hasSpecialChar}
                text="Contains special character (!@#$%^&*)"
              />
              <RequirementItem
                met={passwordValidation.requirements.notCommon}
                text="Not a common password"
              />
              <RequirementItem
                met={passwordValidation.requirements.notSequential}
                text="No sequential characters (abc, 123)"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              formData.confirmPassword &&
              formData.password &&
              formData.confirmPassword !== formData.password
                ? "border-destructive focus:ring-destructive bg-card"
                : formData.confirmPassword &&
                    formData.password &&
                    formData.confirmPassword === formData.password
                  ? "border-green-500 focus:ring-green-500 bg-card"
                  : "border-input focus:ring-accent bg-card"
            }`}
            placeholder="Re-enter your password"
          />
          {formData.confirmPassword && formData.password && (
            <div className="mt-1.5 text-xs">
              {formData.confirmPassword === formData.password ? (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" />
                  <span>Passwords match</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-destructive">
                  <X className="h-3 w-3" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            {error.includes("already exists") && (
              <div className="mt-2">
                <Link href="/auth/login" className="font-medium underline hover:no-underline">
                  Go to sign in →
                </Link>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !passwordValidation.isValid}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}

// Helper component for requirement checklist
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  )
}
