<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatSession;
use App\Models\ChatMessage;

class LiveChatController extends Controller
{
    // For Users
    public function startSession(Request $request)
    {
        $guestId = $request->input('guest_id') ?: uniqid('guest_');
        $session = ChatSession::create(['guest_id' => $guestId, 'status' => 'active']);
        
        // Also save initial AI messages if provided
        $history = $request->input('history', []);
        foreach ($history as $msg) {
            ChatMessage::create([
                'chat_session_id' => $session->id,
                'sender_type' => $msg['role'] === 'user' ? 'user' : 'admin', // AI is saved as admin for simplicity
                'message' => $msg['content']
            ]);
        }
        
        return response()->json(['status' => true, 'session_id' => $session->id]);
    }

    public function userGetMessages(Request $request, $sessionId)
    {
        $messages = ChatMessage::where('chat_session_id', $sessionId)->orderBy('created_at', 'asc')->get();
        return response()->json(['status' => true, 'messages' => $messages]);
    }

    public function userSendMessage(Request $request, $sessionId)
    {
        $request->validate(['message' => 'required|string']);
        
        $session = ChatSession::find($sessionId);
        if (!$session || $session->status !== 'active') {
            return response()->json(['status' => false, 'message' => 'Phiên chat đã kết thúc'], 400);
        }

        $msg = ChatMessage::create([
            'chat_session_id' => $sessionId,
            'sender_type' => 'user',
            'message' => $request->input('message')
        ]);

        $session->touch();

        return response()->json(['status' => true, 'message' => $msg]);
    }

    // For Admin
    public function adminGetSessions()
    {
        // Get all active sessions, ordered by last updated
        $sessions = ChatSession::where('status', 'active')->with(['messages' => function($q) {
            $q->orderBy('created_at', 'asc');
        }])->orderBy('updated_at', 'desc')->get();
        
        return response()->json(['status' => true, 'sessions' => $sessions]);
    }

    public function adminGetMessages($sessionId)
    {
        $messages = ChatMessage::where('chat_session_id', $sessionId)->orderBy('created_at', 'asc')->get();
        return response()->json(['status' => true, 'messages' => $messages]);
    }

    public function adminSendMessage(Request $request, $sessionId)
    {
        $request->validate(['message' => 'required|string']);
        
        $session = ChatSession::find($sessionId);
        if (!$session) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy phiên chat']);
        }

        $msg = ChatMessage::create([
            'chat_session_id' => $sessionId,
            'sender_type' => 'admin',
            'message' => $request->input('message')
        ]);

        $session->touch();

        return response()->json(['status' => true, 'message' => $msg]);
    }
    
    public function adminCloseSession($sessionId)
    {
        $session = ChatSession::find($sessionId);
        if ($session) {
            $session->update(['status' => 'closed']);
            return response()->json(['status' => true]);
        }
        return response()->json(['status' => false], 404);
    }
}
