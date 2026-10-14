# LLCC Portal

A Laravel + Vite prototype of a college portal UI with student and teacher views. The current demo includes dashboard pages, attendance tracking, homework, lesson plans, notifications, messaging, profile controls, and results/schedule views.

## Run locally

Requirements: PHP, Composer, Node.js, and npm.

1. Install PHP dependencies:
   ```bash
   composer install
   ```
2. Create the environment file (Windows PowerShell):
   ```powershell
   Copy-Item .env.example .env
   ```
   On macOS/Linux, use `cp .env.example .env`.
3. Generate the application key:
   ```bash
   php artisan key:generate
   ```
4. Install frontend dependencies and build assets:
   ```bash
   npm install
   npm run build
   ```
5. Start Laravel:
   ```bash
   php artisan serve
   ```
6. Open `http://127.0.0.1:8000/portal`.

For active frontend development, run `npm run dev` in a second terminal instead of relying on a production build.

## Demo accounts

The prototype seeds these accounts in the current browser:

| Role | Email | Password |
|---|---|---|
| Student | student@example.com | 12345 |
| Teacher | teacher@example.com | 12345 |

Choose the matching role on the login screen.

## Important limitations

**This is a frontend demonstration, not a production-ready student information system.**

- Login, registration, messaging, attendance, homework, and other demo records are stored in the browser's `localStorage`; they are not shared with other devices or browsers and can be cleared by the browser.
- Passwords are currently stored as readable browser data. Do not use real passwords or real student information with this prototype.
- The portal does not yet have server-side authentication, role-based authorization, database-backed records, secure password reset, or server-side validation. Hiding a page or button in JavaScript is not a security boundary.
- The “Forgot Password?” link intentionally does not reveal stored passwords. A real deployment needs a secure server-side reset flow.
- Changes made in one browser profile should not be expected to appear for another user or device.

## Recommended next steps

1. Move authentication to Laravel's server-side authentication system and hash passwords.
2. Add database migrations and models for users, classes, attendance, homework submissions, lesson plans, notices, and messages.
3. Enforce student/teacher permissions in middleware, policies, and controller validation.
4. Add automated tests for authentication, permissions, and saving/retrieving records.
5. Test the layout and key workflows on mobile, tablet, and desktop before deployment.
