// Simple fetch wrappers with token handling
const API = (() => {
  const base = "/api";

  function getToken() {
    return localStorage.getItem("token") || "";
  }

  async function request(method, url, body) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${base}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data && data.message ? data.message : "Request failed";
      throw new Error(msg);
    }
    return data.data !== undefined ? data.data : data;
  }

  return {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body),
    patch: (url, body) => request("PATCH", url, body),
    del: (url) => request("DELETE", url),
  };
})();

window.API = API;
