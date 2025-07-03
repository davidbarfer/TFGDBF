import { API_URL } from "@/utils/enviroment";
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
    window.location.href = '/login';
  } else {
    console.error('Signup failed');
  }
}