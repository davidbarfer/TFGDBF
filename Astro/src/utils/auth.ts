export async function login(data: { username: string; password: string }){
  const response = await fetch("http://localhost:1234/login", {
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
  fetch('http://localhost:1234/logout', {
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
  const response = await fetch('http://localhost:1234/signup', {
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