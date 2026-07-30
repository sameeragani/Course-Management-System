/* ============================================================
   VANTAGE LEARNING — shared script
   Handles: dynamic nav highlighting, mobile nav/sidebar toggles,
   and client-side validation for every form in the site.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLinks();
  initNavToggle();
  initSidebarToggle();
  initFormValidation();
});

/* ------------------------------------------------------------
   1. DYNAMIC NAVIGATION — active link highlighting
   Works out the current page from the URL and marks the
   matching link in any .site-nav or .sidebar-nav as active,
   instead of relying on a hard-coded class in the markup.
------------------------------------------------------------- */
function setActiveNavLinks() {
  var currentPage = location.pathname.split("/").pop() || "index.html";

  var navLinks = document.querySelectorAll(".site-nav a, .sidebar-nav a");
  navLinks.forEach(function (link) {
    var linkPage = link.getAttribute("href");
    if (!linkPage) return;
    link.classList.remove("active");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

/* ------------------------------------------------------------
   2. Mobile top-nav toggle (hamburger dropdown)
------------------------------------------------------------- */
function initNavToggle() {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("nav-open");
  });

  // Close the dropdown once a link is chosen (nicer on mobile)
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("nav-open");
    });
  });
}

/* ------------------------------------------------------------
   3. Mobile sidebar toggle (collapsible dashboard menu)
------------------------------------------------------------- */
function initSidebarToggle() {
  var toggle = document.getElementById("sidebarToggle");
  var nav = document.getElementById("sidebarNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("nav-open");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("nav-open");
    });
  });
}

/* ------------------------------------------------------------
   4. FORM VALIDATION
   Small, dependency-free validation helpers, wired up per form.
   Every form uses novalidate in the HTML so we fully control
   the error messages and timing (validate on submit, then
   re-validate each field on blur once the form's been submitted).
------------------------------------------------------------- */

function showError(field, message) {
  field.classList.add("field-error");
  var group = field.closest(".form-group");
  if (group) group.classList.add("has-error");
  var errorEl = document.getElementById(field.id + "-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
  return false;
}

function clearError(field) {
  field.classList.remove("field-error");
  var group = field.closest(".form-group");
  if (group) group.classList.remove("has-error");
  var errorEl = document.getElementById(field.id + "-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
  return true;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRequired(field, label) {
  var value = field.value.trim();
  if (value === "") {
    return showError(field, label + " is required.");
  }
  return clearError(field);
}

function validateEmailField(field) {
  var value = field.value.trim();
  if (value === "") {
    return showError(field, "Email address is required.");
  }
  if (!isValidEmail(value)) {
    return showError(field, "Enter a valid email address.");
  }
  return clearError(field);
}

function validatePasswordField(field, minLength) {
  minLength = minLength || 8;
  var value = field.value;
  if (value === "") {
    return showError(field, "Password is required.");
  }
  if (value.length < minLength) {
    return showError(field, "Password must be at least " + minLength + " characters.");
  }
  return clearError(field);
}

function validateMatch(field, otherField, label) {
  if (field.value === "") {
    return showError(field, label + " is required.");
  }
  if (field.value !== otherField.value) {
    return showError(field, label + " does not match.");
  }
  return clearError(field);
}

function validateCheckbox(field, message) {
  var group = field.closest(".form-group");
  var errorEl = document.getElementById(field.id + "-error");
  if (!field.checked) {
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add("show"); }
    if (group) group.classList.add("has-error");
    return false;
  }
  if (errorEl) { errorEl.textContent = ""; errorEl.classList.remove("show"); }
  if (group) group.classList.remove("has-error");
  return true;
}

function showFormFeedback(form, type, message) {
  var box = form.querySelector(".alert-feedback");
  if (!box) return;
  box.className = "alert alert-feedback show " + (type === "error" ? "alert-error" : "alert-success");
  box.textContent = message;
}

function focusFirstError(form) {
  var firstError = form.querySelector(".field-error");
  if (firstError) firstError.focus();
}

function initFormValidation() {
  bindRegisterForm();
  bindLoginForm();
  bindForgotPasswordForm();
  bindResetPasswordForm();
  bindAddCourseForm();
  bindEditCourseForm();
}

/* ---- Register ---- */
function bindRegisterForm() {
  var form = document.getElementById("register-form");
  if (!form) return;

  var firstName = document.getElementById("first-name");
  var lastName = document.getElementById("last-name");
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var confirm = document.getElementById("confirm-password");
  var terms = document.getElementById("terms");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
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
    showFormFeedback(form, "success", "Account created! Redirecting to your dashboard…");
    setTimeout(function () { window.location.href = "student-dashboard.html"; }, 900);
  });
}

/* ---- Login ---- */
function bindLoginForm() {
  var form = document.getElementById("login-form");
  if (!form) return;

  var email = document.getElementById("email");
  var password = document.getElementById("password");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    if (!validateEmailField(email)) ok = false;
    if (!validateRequired(password, "Password")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please enter a valid email and password.");
      focusFirstError(form);
      return;
    }
    showFormFeedback(form, "success", "Logged in! Redirecting…");
    setTimeout(function () { window.location.href = "student-dashboard.html"; }, 700);
  });
}

/* ---- Forgot password ---- */
function bindForgotPasswordForm() {
  var form = document.getElementById("forgot-form");
  if (!form) return;

  var email = document.getElementById("email");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateEmailField(email)) {
      showFormFeedback(form, "error", "Enter the email address linked to your account.");
      focusFirstError(form);
      return;
    }
    showFormFeedback(form, "success", "If an account exists for that email, a reset link is on its way.");
    form.reset();
  });
}

/* ---- Reset password ---- */
function bindResetPasswordForm() {
  var form = document.getElementById("reset-form");
  if (!form) return;

  var password = document.getElementById("new-password");
  var confirm = document.getElementById("confirm-password");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    if (!validatePasswordField(password)) ok = false;
    if (!validateMatch(confirm, password, "Confirm password")) ok = false;

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }
    showFormFeedback(form, "success", "Password updated! Redirecting to log in…");
    setTimeout(function () { window.location.href = "login.html"; }, 900);
  });
}

/* ---- Add course (admin) ---- */
function bindAddCourseForm() {
  var form = document.getElementById("add-course-form");
  if (!form) return;

  var title = document.getElementById("title");
  var description = document.getElementById("description");
  var price = document.getElementById("price");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    if (!validateRequired(title, "Course title")) ok = false;
    if (!validateRequired(description, "Course description")) ok = false;
    if (price.value !== "" && Number(price.value) < 0) {
      ok = showError(price, "Price can't be negative.");
    } else {
      clearError(price);
    }

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }
    showFormFeedback(form, "success", "Course saved! Redirecting to course list…");
    setTimeout(function () { window.location.href = "courses.html"; }, 900);
  });
}

/* ---- Edit course (admin) ---- */
function bindEditCourseForm() {
  var form = document.getElementById("edit-course-form");
  if (!form) return;

  var title = document.getElementById("title");
  var description = document.getElementById("description");
  var price = document.getElementById("price");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    if (!validateRequired(title, "Course title")) ok = false;
    if (!validateRequired(description, "Course description")) ok = false;
    if (price.value !== "" && Number(price.value) < 0) {
      ok = showError(price, "Price can't be negative.");
    } else {
      clearError(price);
    }

    if (!ok) {
      showFormFeedback(form, "error", "Please fix the highlighted fields and try again.");
      focusFirstError(form);
      return;
    }
    showFormFeedback(form, "success", "Changes saved! Redirecting to course list…");
    setTimeout(function () { window.location.href = "courses.html"; }, 900);
  });
}
