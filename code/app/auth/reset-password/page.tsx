"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Podcast, Check, X, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  type PasswordValidationResult,
} from "@/lib/password-validation"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
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

  useEffect(() => {
    // Check if we have a valid session (user clicked the reset link)
    const checkSession = async () => {
      const supabase = createClient()
      
      // First, check if there are hash fragments in the URL (from direct email link)
      // Supabase sometimes sends links with hash fragments instead of code
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")
      const type = hashParams.get("type")
      
      // If we have hash fragments, set the session
      if (accessToken && refreshToken && type === "recovery") {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        
        if (setSessionError) {
          setError("Invalid or expired reset link. Please request a new password reset.")
          setIsValidSession(false)
          return
        }
        
        // Clear hash from URL
        window.history.replaceState(null, "", window.location.pathname)
      }
      
      // Check if we have a valid session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (!session) {
        setError("Invalid or expired reset link. Please request a new password reset.")
        setIsValidSession(false)
      } else {
        setIsValidSession(true)
      }
    }
    checkSession()
  }, [])

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
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login?reset=success")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Podcast className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Verifying reset link...</h1>
          <p className="text-muted-foreground">Please wait while we verify your reset link.</p>
        </div>
      </div>
    )
  }

  // Show error if session is invalid
  if (isValidSession === false) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
              <X className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Invalid reset link</h1>
          <p className="text-muted-foreground mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="space-y-2">
            <Link
              href="/auth/forgot-password"
              className="block w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Request new reset link
            </Link>
            <Link
              href="/auth/login"
              className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
              <Check className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Password reset successful!</h1>
          <p className="text-muted-foreground">Your password has been updated. Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Podcast className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-serif">Set new password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            New password
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
            Confirm new password
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
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !passwordValidation.isValid}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "Resetting password..." : "Reset password"}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
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

