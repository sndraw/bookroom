declare namespace API {
  interface PasswordInfo {
    // 原密码
    oldpassword: string;
    // 新密码
    password: string;
    // 确认密码
    repassword: string;
  }
}
