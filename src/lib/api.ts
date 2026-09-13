/// <reference types="vite/client" />
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = '';
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || '';
    } catch (e) {
      // Fallback
    }
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
