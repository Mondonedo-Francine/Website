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

## Database-backed features in this branch

Run migrations before testing the new endpoints:

```bash
php artisan migrate
php artisan test
```

- **Attendance:** teachers can load the available demo classes, view a class/date, save each student's status, and retrieve recent save history through authenticated Laravel endpoints.
- **Homework submissions:** students can submit homework to the database and see their own submissions; teachers can review submitted work. The server derives the student account from the signed-in session rather than accepting a student ID from the browser.
- **Authorization:** the attendance endpoints require a teacher account. Homework submission creation requires a student account. Students only receive their own submissions.

## Important limitations

**This is still a prototype, not a production-ready student information system.**

- The attendance roster is still a sample roster defined in the application. It is not yet linked to real enrolled student accounts or official class assignments.
- Lesson plans, notices, and messaging still use browser `localStorage`; those features are not shared across devices and are not protected by server-side authorization yet.
- The “Forgot Password?” link does not reveal stored passwords. A secure email-based password reset flow still needs to be configured.
- Old demo accounts saved in browser storage are no longer accepted as authentication. Use the registration flow or create a teacher account through Tinker.
- Do not enter real student records until class enrollment, teacher-to-class assignments, and all remaining academic features are moved behind authorized server endpoints and tested.

## Recommended next steps

1. Connect class rosters to actual student accounts and assign teachers to classes.
2. Move lesson plans and assignment publishing to the database, then link homework submissions to those assignments.
3. Move notices and messages to authorized server-side endpoints.
4. Complete automated tests and manually verify the workflows on mobile, tablet, and desktop before deployment.
