export const passwordRequirementLabels = {
  length: "8 characters minimum",
  number: "numbers (0-9)",
  uppercase: "Uppercase letters (A-Z)",
  special: "special characters (!@#$%^&*)"
} as const;

export function getPasswordRequirementState(password: string) {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };
}

export function isPasswordValid(password: string) {
  const requirements = getPasswordRequirementState(password);
  return Object.values(requirements).every(Boolean);
}

export function getPasswordValidationMessage() {
  return "Password must be at least 8 characters and include a number, an uppercase letter, and a special character (!@#$%^&*).";
}
