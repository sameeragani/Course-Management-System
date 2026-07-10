# LearnHub – Single HTML/CSS Project

This is one unified static website (plain HTML + CSS, no backend, no JavaScript
required) covering both modules you listed. Every page shares the same
`style.css`, so it now behaves like one site instead of two separate ones.

## How login works (no backend)
`login.html` has two tabs — **Student Login** and **Admin Login** — built with
a pure-CSS radio-button toggle (no JS). Since there's no server/database:
- The Student panel's "Login" button goes straight to `student-dashboard.html`
- The Admin panel's "Login" button goes straight to `admin-dashboard.html`

This simulates authentication for a static prototype. To make it a *real*
login (checking email/password against a database), you'd need a backend
(PHP, Node, etc.) or at least JavaScript + local storage — let me know if you
want that added later.

## Module 1 – User Authentication
| Page | Purpose |
|---|---|
| `index.html` | Public homepage |
| `register.html` | New student sign-up (admin accounts aren't self-registered) |
| `login.html` | Student / Admin tab login |
| `forgot-password.html` | Request reset link |
| `reset-password.html` | Set new password |

## Module 2 – Student Side
| Page | Purpose |
|---|---|
| `student-dashboard.html` | Stats + enrolled courses overview |
| `my-courses.html` | List of enrolled courses with progress |
| `browse-courses.html` | All available courses, with seats left |
| `course-details.html` | Single course info + Enroll button |
| `student-profile.html` | Edit student details |

## Module 2 – Course Management (Admin)
| Page | Purpose |
|---|---|
| `admin-dashboard.html` | Stats + course enrollment/availability overview |
| `courses.html` | Manage (edit/delete) all courses |
| `add-course.html` | Add a new course |
| `edit-course.html` | Edit an existing course |

## Images
The CSS/HTML reference an `images/` folder (banner, course thumbnails, login
illustration) that isn't included here — drop your own images into an
`images/` folder next to these files, using these names, and they'll appear:
`banner.jpg`, `html-course.jpg`, `python-course.jpg`, `uiux-course.jpg`,
`data-course.jpg`, `login-illustration.jpg`.

## Notes
- All forms are plain HTML (`<form>`/`<input>`) for visual completeness, but
  since there's no backend, "Submit"-type buttons are actual links (`<a>`)
  that just navigate to the next page — nothing is saved.
- Numbers on dashboards (student counts, enrollments, seats) are static
  sample data for demonstration.
