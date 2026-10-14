<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DirectMessageController extends Controller
{
    private function requireMessagingUser(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user && in_array($user->role, ['student', 'teacher'], true),
            403,
            'Only students and teachers can use direct messaging.'
        );

        return $user;
    }

    public function contacts(Request $request): JsonResponse
    {
        $user = $this->requireMessagingUser($request);

        $contacts = User::query()
            ->whereKeyNot($user->id)
            ->whereIn('role', ['student', 'teacher'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'class_name']);

        return response()->json(['contacts' => $contacts]);
    }

    public function index(Request $request, User $user): JsonResponse
    {
        $current = $this->requireMessagingUser($request);

        abort_if($current->id === $user->id, 422, 'You cannot message yourself.');
        abort_unless(
            in_array($user->role, ['student', 'teacher'], true),
            404,
            'User not found.'
        );

        $messages = DirectMessage::query()
            ->with('sender:id,name')
            ->where(function ($query) use ($current, $user) {
                $query->where('sender_id', $current->id)
                    ->where('recipient_id', $user->id);
            })
            ->orWhere(function ($query) use ($current, $user) {
                $query->where('sender_id', $user->id)
                    ->where('recipient_id', $current->id);
            })
            ->latest('id')
            ->limit(200)
            ->get()
            ->reverse()
            ->values()
            ->map(fn (DirectMessage $message) => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'recipient_id' => $message->recipient_id,
                'sender_name' => $message->sender->name,
                'message' => $message->message,
                'created_at' => $message->created_at?->toISOString(),
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $current = $this->requireMessagingUser($request);

        abort_if($current->id === $user->id, 422, 'You cannot message yourself.');
        abort_unless(
            in_array($user->role, ['student', 'teacher'], true),
            404,
            'User not found.'
        );

        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = DirectMessage::query()->create([
            'sender_id' => $current->id,
            'recipient_id' => $user->id,
            'message' => trim($data['message']),
        ]);

        $message->load('sender:id,name');

        return response()->json([
            'message' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'recipient_id' => $message->recipient_id,
                'sender_name' => $message->sender->name,
                'message' => $message->message,
                'created_at' => $message->created_at?->toISOString(),
            ],
        ], 201);
    }
}
