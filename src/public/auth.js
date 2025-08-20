(function () {
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const form = document.getElementById("auth-form");
  const btnLogin = document.getElementById("btn-login");
  const btnSignup = document.getElementById("btn-signup");
  const errorEl = document.getElementById("auth-error");

  let mode = "login"; // 'login' | 'signup'

  function setMode(next) {
    mode = next;
    document.getElementById("auth-header").textContent =
      mode === "login" ? "Sign in" : "Create account";
    btnLogin.classList.toggle("active", mode === "login");
    btnSignup.classList.toggle("active", mode === "signup");
    btnLogin.setAttribute("aria-pressed", mode === "login");
    btnSignup.setAttribute("aria-pressed", mode === "signup");
    errorEl.textContent = "";
  }

  btnLogin.addEventListener("click", () => setMode("login"));
  btnSignup.addEventListener("click", () => setMode("signup"));

  function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function isStrongPassword(str) {
    return typeof str === "string" && str.length >= 6;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value;

    if (!isEmail(email)) {
      errorEl.textContent = "Invalid email";
      emailEl.focus();
      return;
    }
    if (!isStrongPassword(password)) {
      errorEl.textContent = "Password must be at least 6 characters";
      passwordEl.focus();
      return;
    }

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const data = await API.post(endpoint, { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      window.location.href = "./index.html";
    } catch (err) {
      errorEl.textContent = err.message || "Something went wrong";
    }
  });

  // If already logged in, redirect
  if (localStorage.getItem("token")) {
    window.location.href = "./index.html";
  }
})();
