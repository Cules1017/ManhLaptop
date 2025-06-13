<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['status' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:200',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }
        $category = Category::create($validator->validated());
        return response()->json(['status' => true, 'data' => $category]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $category = Category::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:200',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }
        $category->update($validator->validated());
        return response()->json(['status' => true, 'data' => $category]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['status' => true, 'message' => 'Xoá danh mục thành công']);
    }
} 