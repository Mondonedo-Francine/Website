<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Creates predictable demo student accounts for local testing.
 *
 * Run explicitly with:
 * php artisan db:seed --class=Database\\Seeders\\DemoDataSeeder
 *
 * Do not run this seeder on a production database.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            'BSIT 1-A' => [
                'Althea Cruz',
                'Joshua Garcia',
                'Mika Santos',
                'Nathan Reyes',
                'Sofia Flores',
            ],
            'BSIT 1-B' => [
                'Andrea Ramos',
                'Daniel Torres',
                'Ella Mendoza',
                'Gabriel Lim',
                'Isabelle Tan',
            ],
            'BSIT 2-A' => [
                'Alyssa Dizon',
                'Brandon Lee',
                'Chloe Rivera',
                'Dylan Bautista',
                'Faith Navarro',
            ],
            'BSIT 2-B' => [
                'Angela Villanueva',
                'Christian Flores',
                'Danica Reyes',
                'Ethan Mendoza',
                'Jasmine Cruz',
            ],
        ];

        $number = 1;

        foreach ($classes as $className => $students) {
            $yearLevel = str_contains($className, '1-') ? '1st Year' : '2nd Year';

            foreach ($students as $name) {
                $email = sprintf('demo.student%02d@llcc.test', $number);

                User::query()->updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'phone' => sprintf('0999000%04d', $number),
                        'password' => 'DemoStudent123!',
                        'role' => 'student',
                        'class_name' => $className,
                        'year_level' => $yearLevel,
                    ]
                );

                $number++;
            }
        }
    }
}
