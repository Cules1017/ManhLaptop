<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    // Lấy danh sách liên hệ (có phân trang và lọc)
    public function index(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }

        $query = Contact::query();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%$keyword%")
                  ->orWhere('email', 'like', "%$keyword%")
                  ->orWhere('phone', 'like', "%$keyword%");
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->per_page ?? 10;
        $contacts = $query->paginate($perPage);

        return response()->json([
            'status' => true,
            'data' => $contacts
        ]);
    }

    // Cập nhật trạng thái / ghi chú
    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }

        $contact = Contact::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:new,processing,resolved',
            'admin_note' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $contact->update($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thành công',
            'data' => $contact
        ]);
    }

    // Xóa liên hệ
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }

        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa liên hệ'
        ]);
    }
}
