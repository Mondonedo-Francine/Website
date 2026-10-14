
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'profile_picture')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('profile_picture')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Do not drop this column; another migration may own it.
    }
};
