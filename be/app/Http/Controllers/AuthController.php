<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'phone' => 'required|string|max:255',
            ]);
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
            ]);
    
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'status' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
                'error' => $th->getTrace()
            ], 500);
        }
        
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => false,
                'message' => 'Sai email hoặc mật khẩu.',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Đăng nhập thành công.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Successfully logged out'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->has('address')) {
            $user->address = $request->address;
        }
        $user->save();
        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user
        ]);
    }
}
