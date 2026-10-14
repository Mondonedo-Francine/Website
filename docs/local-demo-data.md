# Local Demo Data

This repository includes an explicit demo seeder for local development. It creates 20 sample student accounts across four sections: BSIT 1-A, BSIT 1-B, BSIT 2-A, and BSIT 2-B.

## Run it locally

From the project directory, run:

```powershell
php artisan db:seed --class="Database\Seeders\DemoDataSeeder"
```

The seeder uses `updateOrCreate` with reserved `.test` email addresses, so rerunning it updates those same demo accounts rather than creating duplicates.

## Demo student login

- Role: Student
- Email: `demo.student01@llcc.test` through `demo.student20@llcc.test`
- Password: `DemoStudent123!`

These accounts are for local testing only. Do not run the demo seeder against a production database or use these credentials for real students. The seeder creates student accounts; it does not create a demo administrator or teacher account.
