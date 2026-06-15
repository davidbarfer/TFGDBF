import { API_URL } from "@/utils/enviroment";
import { showToast, showToastOnLoad, TOASTSTYLE } from "./toaster";
export async function login(data: { username: string; password: string }){
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    const responseMsg = await response.json();
    showToastOnLoad(responseMsg.message, TOASTSTYLE.success)
    window.location.href = '/';
  } else {
    const responseMsg = await response.json();
    showToast(responseMsg.error, TOASTSTYLE.error)
  }
}
export function logout() {
  fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(() => {
      showToastOnLoad('Logout successful')
      window.location.href = '/login';
    })
    .catch((error) => {
      showToast(error, TOASTSTYLE.error)
    });
}
export async function signup(data: { username: string; password: string; role: string }) {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    const responseMsg = await response.json();
    showToastOnLoad(responseMsg?.message, TOASTSTYLE.success);
  } else {
    const responseMsg = await response.json();
    showToastOnLoad(responseMsg?.error, TOASTSTYLE.error);
  }
  window.location.href = '/login';
}