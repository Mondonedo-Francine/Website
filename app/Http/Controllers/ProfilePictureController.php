<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Storage;

class ProfilePictureController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'picture' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $oldPath = $user->profile_picture;
        $path = $request->file('picture')->store('profile-pictures/' . $user->id, 'public');

        $user->profile_picture = $path;
        $user->save();

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'message' => 'Profile picture saved successfully.',
            'profile_picture_url' => Storage::disk('public')->url($path),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        $path = $user->profile_picture;

        $user->profile_picture = null;
        $user->save();

        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json(['message' => 'Profile picture removed.']);
    }
}
