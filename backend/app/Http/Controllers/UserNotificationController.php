<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'filter' => 'nullable|in:all,unread,interviews,reminders',
        ]);
        $filter = $filters['filter'] ?? 'all';
        $notifications = UserNotification::where('user_id', $request->user()->id)
            ->when($filter === 'unread', fn ($query) => $query->whereNull('read_at'))
            ->when($filter === 'interviews', fn ($query) => $query->where('type', 'interview'))
            ->when($filter === 'reminders', fn ($query) => $query->whereIn('type', ['reminder', 'follow_up']))
            ->with(['event', 'application.company'])
            ->latest()
            ->paginate(30);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread_count' => UserNotification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request, int $id)
    {
        $notification = UserNotification::where('user_id', $request->user()->id)->whereKey($id)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }
        $notification->update(['read_at' => now()]);

        return response()->json(['notification' => $notification]);
    }

    public function markAllRead(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    public function destroy(Request $request, int $id)
    {
        $deleted = UserNotification::where('user_id', $request->user()->id)->whereKey($id)->delete();

        return $deleted
            ? response()->json(['message' => 'Notification dismissed.'])
            : response()->json(['message' => 'Notification not found'], 404);
    }
}
