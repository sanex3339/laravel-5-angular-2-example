<?php

namespace App\Http\Controllers\ExampleControllers;

use App\Http\Controllers\Controller;
use BannersCreator\Services\PSDParser;
use Illuminate\Http\Request;
use File;
use Session;

class UploadController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest');
    }

    public function uploadFile()
    {
        return json_encode([
            'success' => true,
            'message' => 'PLACEHOLDER_DATA'
        ]);
    }
}
