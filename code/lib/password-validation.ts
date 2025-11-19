// Common weak passwords list (top 100 most common)
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "123456789",
  "12345678",
  "12345",
  "1234567",
  "1234567890",
  "qwerty",
  "abc123",
  "password1",
  "123123",
  "welcome",
  "monkey",
  "12345678910",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "bailey",
  "passw0rd",
  "shadow",
  "1234",
  "superman",
  "qwerty123",
  "michael",
  "football",
  "jesus",
  "ninja",
  "mustang",
  "password123",
  "admin",
  "login",
  "welcome123",
  "princess",
  "solo",
  "welcome1",
  "qwertyuiop",
  "solo",
  "admin123",
  "password12",
  "qwerty1",
  "password2",
  "welcome12",
  "password1234",
  "qwerty1234",
  "admin1",
]

export interface PasswordValidationResult {
  isValid: boolean
  strength: "weak" | "fair" | "good" | "strong"
  score: number // 0-100
  errors: string[]
  requirements: {
    minLength: boolean
    hasUpperCase: boolean
    hasLowerCase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
    notCommon: boolean
    notSequential: boolean
  }
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    notSequential: !isSequential(password),
  }

  // Check requirements
  if (!requirements.minLength) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!requirements.hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!requirements.hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!requirements.hasNumber) {
    errors.push("Password must contain at least one number")
  }
  if (!requirements.hasSpecialChar) {
    errors.push("Password must contain at least one special character (!@#$%^&*)")
  }
  if (!requirements.notCommon) {
    errors.push("Password is too common. Please choose a more unique password")
  }
  if (!requirements.notSequential) {
    errors.push("Password contains sequential characters (e.g., abc, 123)")
  }

  // Calculate strength score
  let score = 0
  if (requirements.minLength) score += 15
  if (password.length >= 12) score += 10 // Bonus for longer passwords
  if (requirements.hasUpperCase) score += 15
  if (requirements.hasLowerCase) score += 15
  if (requirements.hasNumber) score += 15
  if (requirements.hasSpecialChar) score += 15
  if (requirements.notCommon) score += 10
  if (requirements.notSequential) score += 5

  // Determine strength level
  let strength: "weak" | "fair" | "good" | "strong"
  if (score < 40) {
    strength = "weak"
  } else if (score < 60) {
    strength = "fair"
  } else if (score < 80) {
    strength = "good"
  } else {
    strength = "strong"
  }

  const isValid = errors.length === 0 && score >= 60

  return {
    isValid,
    strength,
    score,
    errors,
    requirements,
  }
}

function isSequential(password: string): boolean {
  const lower = password.toLowerCase()
  // Check for sequential patterns like abc, 123, qwerty
  const sequentialPatterns = [
    "abcdefghijklmnopqrstuvwxyz",
    "01234567890",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ]

  for (const pattern of sequentialPatterns) {
    for (let i = 0; i <= pattern.length - 3; i++) {
      const seq = pattern.substring(i, i + 3)
      if (lower.includes(seq)) {
        return true
      }
    }
  }

  // Check for reverse sequential
  for (const pattern of sequentialPatterns) {
    const reversed = pattern.split("").reverse().join("")
    for (let i = 0; i <= reversed.length - 3; i++) {
      const seq = reversed.substring(i, i + 3)
      if (lower.includes(seq)) {
        return true
      }
    }
  }

  return false
}

export function getPasswordStrengthColor(strength: PasswordValidationResult["strength"]): string {
  switch (strength) {
    case "weak":
      return "bg-red-500"
    case "fair":
      return "bg-orange-500"
    case "good":
      return "bg-yellow-500"
    case "strong":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

export function getPasswordStrengthText(strength: PasswordValidationResult["strength"]): string {
  switch (strength) {
    case "weak":
      return "Weak"
    case "fair":
      return "Fair"
    case "good":
      return "Good"
    case "strong":
      return "Strong"
    default:
      return "Unknown"
  }
}

