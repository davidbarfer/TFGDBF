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