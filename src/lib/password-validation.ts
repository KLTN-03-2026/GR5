export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ hoa." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ số." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt." };
  }
  return { valid: true, message: "" };
}
