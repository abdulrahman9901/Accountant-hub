<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed default demo user for instant login
        User::query()->updateOrCreate(
            ['email' => 'accountant@example.com'],
            [
                'name' => 'Demo Accountant',
                'password' => Hash::make('password123'),
            ]
        );

        $this->call([
            JobCategorySeeder::class,
            JobSeeder::class,
        ]);
    }
}
