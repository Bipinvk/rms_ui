const setToken = (token) => localStorage.setItem('token', token);
const getToken = () => localStorage.getItem('token');
const removeToken = () => localStorage.removeItem('token');

const apiCall = async (url, options = {}) => {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Add Content-Type only for non-GET requests with JSON bodies (not FormData)
  if (options.method && options.method !== 'GET' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  options.headers = { ...options.headers, ...headers };
  const res = await fetch(url, options);
  if (res.status === 401) removeToken();
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Request failed');
  }
  return res.json();
};

export { setToken, getToken, removeToken, apiCall };