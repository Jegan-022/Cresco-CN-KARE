/// <reference types="vite/client" />
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = '';
  const user = auth.currentUser;
  
  if (user) {
    token = await user.getIdToken();
  }

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
