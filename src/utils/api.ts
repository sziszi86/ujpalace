export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  });
}