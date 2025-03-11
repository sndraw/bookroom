import { request } from '@umijs/max';

/** POST /logout */
export async function logout(options?: any) {
  return request<API.Result_string_>('/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** PUT /pwd */
export async function pwdChange(body?: API.PasswordInfo, options?: any) {
  return request<API.Result_string_>(`/pwd`, {
    data: body,
    method: 'POST',
    ...(options || {}),
  });
}
