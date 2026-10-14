<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAccountSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'adminaccount@gmail.com'],
            [
                'name' => 'LLCCAdmin',
                'phone' => '09123451677',
                'password' => Hash::make('LLCCAdmin1'),
                'role' => 'admin',
            ]
        );
    }
}
