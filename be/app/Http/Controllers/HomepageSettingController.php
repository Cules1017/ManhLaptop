<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HomepageSetting;
use Illuminate\Support\Facades\Storage;

class HomepageSettingController extends Controller
{
    /**
     * Public method to get all homepage settings
     */
    public function index()
    {
        $settings = HomepageSetting::all()->pluck('setting_value', 'setting_key')->toArray();
        
        // Decode JSON arrays for badges and logos
        if (isset($settings['trust_badges'])) {
            $settings['trust_badges'] = json_decode($settings['trust_badges'], true) ?? [];
        }
        if (isset($settings['partner_logos'])) {
            $settings['partner_logos'] = json_decode($settings['partner_logos'], true) ?? [];
        }

        return response()->json([
            'status' => true,
            'data' => $settings
        ]);
    }

    /**
     * Admin method to update settings
     */
    public function update(Request $request)
    {
        $data = $request->except(['_token']);
        
        // Handle file uploads for hero background
        if ($request->hasFile('hero_image')) {
            $path = $request->file('hero_image')->store('homepage', 'public');
            $data['hero_image_url'] = '/storage/' . $path;
            unset($data['hero_image']);
        }
        
        // Handle badges and logos if they are sent as JSON strings
        if (isset($data['trust_badges']) && is_string($data['trust_badges'])) {
            // we will just store it as string
            $data['trust_badges'] = $data['trust_badges'];
        } else if (isset($data['trust_badges']) && is_array($data['trust_badges'])) {
             $data['trust_badges'] = json_encode($data['trust_badges']);
        }
        
        if (isset($data['partner_logos']) && is_string($data['partner_logos'])) {
            $data['partner_logos'] = $data['partner_logos'];
        } else if (isset($data['partner_logos']) && is_array($data['partner_logos'])) {
             $data['partner_logos'] = json_encode($data['partner_logos']);
        }

        foreach ($data as $key => $value) {
            HomepageSetting::updateOrCreate(
                ['setting_key' => $key],
                ['setting_value' => $value]
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Admin method to upload a general image (for logos, badges)
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('homepage', 'public');
            return response()->json([
                'status' => true,
                'url' => '/storage/' . $path
            ]);
        }

        return response()->json(['status' => false, 'message' => 'No file uploaded'], 400);
    }
}
