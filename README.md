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

## Authentication

The portal uses Laravel session authentication for login, registration, and logout. Public registration creates student accounts only. Teacher accounts must be created by a trusted administrator.

To create a teacher account locally, run:

```bash
php artisan tinker
```

Then enter this PHP expression in Tinker (replace the name, email, phone, and password):

```php
App\\Models\\User::create([
    'name' => 'Portal Teacher',
    'email' => 'teacher@example.com',
    'phone' => '09170000000',
    'password' => 'ChangeThisPassword123!',
    'role' => 'teacher',
]);
```

The User model hashes passwords automatically. Do not use the example password for a real account.

## Important limitations

**This is a frontend demonstration, not a production-ready student information system.**

- The login, registration, and logout flows now use Laravel sessions and hashed passwords. However, attendance, homework, lesson plans, notices, and messages still have frontend features that use browser `localStorage`; those records are not yet shared between devices or accounts.
- Server-side authorization and database persistence for each academic feature are not yet complete. Hiding a page or button in JavaScript is not a security boundary; do not use real student records until each feature is moved behind authorized Laravel endpoints.
- The “Forgot Password?” link does not reveal stored passwords. A secure email-based password reset flow still needs to be configured.
- Old demo accounts saved in browser storage are no longer accepted as authentication. Use the new registration flow or create a teacher account through Tinker.

## Recommended next steps

1. Move authentication to Laravel's server-side authentication system and hash passwords.
2. Add database migrations and models for users, classes, attendance, homework submissions, lesson plans, notices, and messages.
3. Enforce student/teacher permissions in middleware, policies, and controller validation.
4. Add automated tests for authentication, permissions, and saving/retrieving records.
5. Test the layout and key workflows on mobile, tablet, and desktop before deployment.
