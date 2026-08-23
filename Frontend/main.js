/* ============================================================
   VANTAGE LEARNING — application script (single file)
   Combines what were previously separate modules:
   state -> api -> auth -> validation -> ui -> main
   Kept in labeled sections below so the boundaries between
   them are still easy to see and maintain.
   ============================================================ */


/* ============================================================
   SECTION 1: STATE
   Centralized application state.
   - Logged-in user persists in localStorage (survives closing
     the browser — like a real "remember me" session).
   - Selected course persists in sessionStorage (only needed for
     the current visit, e.g. carrying a choice from course-details
     into enrollment-success).
   ============================================================ */

const USER_KEY = "vantage_user";
const COURSE_KEY = "vantage_selected_course";

function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

function getSelectedCourse() {
  const raw = sessionStorage.getItem(COURSE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSelectedCourse(course) {
  sessionStorage.setItem(COURSE_KEY, JSON.stringify(course));
}


/* ============================================================
   SECTION 2: API
   Reusable "API" functions. There's no real backend behind this
   site, so each call simulates a network round-trip with a short
   delay and returns a { success, ... } result — the same shape
   a real fetch() call to a REST API would resolve to. Swapping
   these bodies out for real fetch() calls later won't require
   touching any other section.
   ============================================================ */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginRequest(email, password) {
  await delay(500);
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  return {
    success: true,
    user: { firstName: email.split("@")[0], email },
  };
}

async function registerRequest({ firstName, lastName, email, password }) {
  await delay(600);
  return {
    success: true,
    user: { firstName, lastName, email },
  };
}

async function requestPasswordReset(email) {
  await delay(500);
  return {
    success: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

async function resetPasswordRequest(newPassword) {
  await delay(500);
  return { success: true, message: "Password updated." };
}

async function saveCourseRequest(courseData) {
  await delay(600);
  return { success: true, course: courseData };
}


/* ============================================================
   SECTION 3: AUTH
   All authentication logic lives here. UI code never calls
   localStorage or the API functions directly for auth — it
   calls these functions instead.
   ============================================================ */

async function login(email, password) {
  const result = await loginRequest(email, password);
  if (result.success) setCurrentUser(result.user);
  return result;
}

async function register(data) {
  const result = await registerRequest(data);
  if (result.success) setCurrentUser(result.user);
  return result;
}

function logout() {
  clearCurrentUser();
}

async function forgotPassword(email) {
  return requestPasswordReset(email);
}

async function resetPassword(newPassword) {
  return resetPasswordRequest(newPassword);
}


/* ============================================================
   SECTION 4: VALIDATION
   Reusable field-level validation. Each validate* function
   returns true/false and manages the error message + red border
   for its field so calling code stays a one-liner.
   ============================================================ */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(field, message) {
  field.classList.add("field-error");
  const group = field.closest(".form-group");
  if (group) group.classList.add("has-error");
  const errorEl = document.getElementById(field.id + "-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
  return false;
}

function clearError(field) {
  field.classList.remove("field-error");
  const group = field.closest(".form-group");
  if (group) group.classList.remove("has-error");
  const errorEl = document.getElementById(field.id + "-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
  return true;
}

function validateRequired(field, label) {
  const value = field.value.trim();
  if (value === "") return showError(field, label + " is required.");
  return clearError(field);
}

function validateEmailField(field) {
  const value = field.value.trim();
  if (value === "") return showError(field, "Email address is required.");
  if (!isValidEmail(value)) return showError(field, "Enter a valid email address.");
  return clearError(field);
}

function validatePasswordField(field, minLength = 8) {
  const value = field.value;
  if (value === "") return showError(field, "Password is required.");
  if (value.length < minLength) {
    return showError(field, "Password must be at least " + minLength + " characters.");
  }
  return clearError(field);
}

function validateMatch(field, otherField, label) {
  if (field.value === "") return showError(field, label + " is required.");
  if (field.value !== otherField.value) return showError(field, label + " does not match.");
  return clearError(field);
}

function validateCheckbox(field, message) {
  const group = field.closest(".form-group");
  const errorEl = document.getElementById(field.id + "-error");
  if (!field.checked) {
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add("show"); }
    if (group) group.classList.add("has-error");
    return false;
  }
  if (errorEl) { errorEl.textContent = ""; errorEl.classList.remove("show"); }
  if (group) group.classList.remove("has-error");
  return true;
}

function validateNonNegativeNumber(field, message) {
  if (field.value !== "" && Number(field.value) < 0) {
    return showError(field, message);
  }
  return clearError(field);
}


/* ============================================================
   SECTION 5: UI
   Reusable, DOM-facing functions shared across pages. These
   are given data (like the current user) and update the page
   to match — they don't read/write storage themselves.
   ============================================================ */

function setActiveNavLinks() {
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a, .sidebar-nav a").forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (!linkPage) return;
    link.classList.toggle("active", linkPage === currentPage);
  });
}

function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("nav-open"));
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => nav.classList.remove("nav-open"))
  );
}

function initSidebarToggle() {
  const toggle = document.getElementById("sidebarToggle");
  const nav = document.getElementById("sidebarNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("nav-open"));
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => nav.classList.remove("nav-open"))
  );
}

function showFormFeedback(form, type, message) {
  const box = form.querySelector(".alert-feedback");
  if (!box) return;
  box.className = "alert alert-feedback show " + (type === "error" ? "alert-error" : "alert-success");
  box.textContent = message;
}

function focusFirstError(form) {
  const firstError = form.querySelector(".field-error");
  if (firstError) firstError.focus();
}

/* Reflect login state in the header / sidebar.
   Any element with id="authLinks" (public pages) gets swapped
   between "Log in / Get started" and "Dashboard / Log out".
   Any element with id="sidebarUserName" gets the real user's name.
   Any element with [data-action="logout"] triggers logout(). */
function updateAuthUI(user) {
  const authLinks = document.getElementById("authLinks");
  if (authLinks) {
    if (user) {
      authLinks.innerHTML =
        '<a href="student-dashboard.html" class="btn btn-outline btn-sm">Dashboard</a>' +
        '<a href="index.html" class="btn btn-primary btn-sm" data-action="logout">Log out</a>';
    } else {
      authLinks.innerHTML =
        '<a href="login.html" class="btn btn-outline btn-sm">Log in</a>' +
        '<a href="register.html" class="btn btn-primary btn-sm">Get started</a>';
    }
  }

  const nameEl = document.getElementById("sidebarUserName");
  if (nameEl && user) {
    const fullName = user.firstName + (user.lastName ? " " + user.lastName : "");
    nameEl.textContent = fullName;
  }

  bindLogoutLinks();
}

function bindLogoutLinks() {
  document.querySelectorAll('[data-action="logout"]').forEach((link) => {
    // avoid double-binding if updateAuthUI ever runs twice
    if (link.dataset.bound) return;
    link.dataset.bound = "true";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
      window.location.href = "index.html";
    });
  });
}


/* ============================================================
   SECTION 6: MAIN (entry point)
   Runs on every page. Each bind* function checks whether its
   form/element exists on the current page before doing
   anything, so this one file safely covers all 21 pages.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLinks();
  initNavToggle();
  initSidebarToggle();
  updateAuthUI(getCurrentUser());

  bindRegisterForm();
  bindLoginForm();
  bindForgotPasswordForm();
  bindResetPasswordForm();
  bindAddCourseForm();
  bindEditCourseForm();
  bindEnrollAction();
  fillEnrollmentSuccess();
});

/* ---- Register ---- */
function bindRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirm = document.getElementById("confirm-password");
  const terms = document.getElementById("terms");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!validateRequired(firstName, "First name")) ok = false;
    if (!validateRequired(lastName, "Last name")) ok = false;
    if (!validateEmailField(email)) ok = false;
    if (!validatePasswordField(password)) ok = false;
    if (!validateMatch(confirm, password, "Confirm password")) ok = false;
    if (!validateCheckbox(terms, "You must agree to the terms to continue.")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }

    const result = await register({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    if (result.success) {
      showFormFeedback(form, "success", "Account created! Redirecting to your dashboard…");
      setTimeout(() => (window.location.href = "student-dashboard.html"), 900);
    } else {
      showFormFeedback(form, "error", result.message || "Something went wrong. Please try again.");
    }
  });
}

/* ---- Login ---- */
function bindLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!validateEmailField(email)) ok = false;
    if (!validateRequired(password, "Password")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please enter a valid email and password.");
      focusFirstError(form);
      return;
    }

    const result = await login(email.value.trim(), password.value);

    if (result.success) {
      showFormFeedback(form, "success", "Logged in! Redirecting…");
      setTimeout(() => (window.location.href = "student-dashboard.html"), 700);
    } else {
      showFormFeedback(form, "error", result.message || "Could not log in. Please try again.");
    }
  });
}

/* ---- Forgot password ---- */
function bindForgotPasswordForm() {
  const form = document.getElementById("forgot-form");
  if (!form) return;

  const email = document.getElementById("email");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateEmailField(email)) {
      showFormFeedback(form, "error", "Enter the email address linked to your account.");
      focusFirstError(form);
      return;
    }
    const result = await forgotPassword(email.value.trim());
    showFormFeedback(form, "success", result.message);
    form.reset();
  });
}

/* ---- Reset password ---- */
function bindResetPasswordForm() {
  const form = document.getElementById("reset-form");
  if (!form) return;

  const password = document.getElementById("new-password");
  const confirm = document.getElementById("confirm-password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!validatePasswordField(password)) ok = false;
    if (!validateMatch(confirm, password, "Confirm password")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }

    await resetPassword(password.value);
    showFormFeedback(form, "success", "Password updated! Redirecting to log in…");
    setTimeout(() => (window.location.href = "login.html"), 900);
  });
}

/* ---- Add course (admin) ---- */
function bindAddCourseForm() {
  const form = document.getElementById("add-course-form");
  if (!form) return;

  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const price = document.getElementById("price");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!validateRequired(title, "Course title")) ok = false;
    if (!validateRequired(description, "Course description")) ok = false;
    if (!validateNonNegativeNumber(price, "Price can't be negative.")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }

    await saveCourseRequest({ title: title.value.trim(), description: description.value.trim(), price: price.value });
    showFormFeedback(form, "success", "Course saved! Redirecting to course list…");
    setTimeout(() => (window.location.href = "courses.html"), 900);
  });
}

/* ---- Edit course (admin) ---- */
function bindEditCourseForm() {
  const form = document.getElementById("edit-course-form");
  if (!form) return;

  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const price = document.getElementById("price");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!validateRequired(title, "Course title")) ok = false;
    if (!validateRequired(description, "Course description")) ok = false;
    if (!validateNonNegativeNumber(price, "Price can't be negative.")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }

    await saveCourseRequest({ title: title.value.trim(), description: description.value.trim(), price: price.value });
    showFormFeedback(form, "success", "Changes saved! Redirecting to course list…");
    setTimeout(() => (window.location.href = "courses.html"), 900);
  });
}

/* ---- Selected-course state: course-details -> enrollment-success ---- */
function bindEnrollAction() {
  const btn = document.getElementById("enrollBtn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    setSelectedCourse({ title: "UI Design Foundations", price: "$49.00" });
    window.location.href = btn.getAttribute("href");
  });
}

function fillEnrollmentSuccess() {
  const nameEl = document.getElementById("successCourseName");
  if (!nameEl) return;
  const course = getSelectedCourse();
  if (!course) return;
  nameEl.textContent = course.title;
  document.querySelectorAll(".js-course-name").forEach((el) => (el.textContent = course.title));
  document.querySelectorAll(".js-course-price").forEach((el) => (el.textContent = course.price));
}
