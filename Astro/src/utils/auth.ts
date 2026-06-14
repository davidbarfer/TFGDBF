import { API_URL } from "@/utils/enviroment";
import { showToastOnLoad, TOASTSTYLE } from "./toaster";
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
    window.location.href = '/';
  } else {
    console.error("Login failed");
  }
}
export function logout() {
  fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(() => {
      window.location.href = '/login';
    })
    .catch((error) => {
      console.error('Logout error:', error);
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
    showToastOnLoad(responseMsg?.message, TOASTSTYLE.error);
  }
  window.location.href = '/login';
}