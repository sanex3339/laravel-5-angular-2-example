<?php

namespace App\Http\Controllers\BannersCreator;

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

    public function uploadFile(Request $request)
    {
        if (!$request->hasFile('uploads')) {
            return json_encode([
                'success' => false,
                'error' => [
                    'code' => 'UPLOAD_ERR_NO_FILE',
                    'message' => 'No file was uploaded'
                ]
            ]);
        }

        $files = $request->file('uploads');
        $path = base_path() . '/public/uploads/' . Session::getId() . '/';

        File::cleanDirectory(base_path() . '/public/uploads/');

        foreach ($files as $file) {
            $file->move($path, $file->getClientOriginalName());
        }

        $psdParser = new PSDParser($files, $path);
        $psdParser->parse();
        $convertedFiles = $psdParser->getConvertedFileNames();

        return json_encode([
            'success' => true,
            'files' => $convertedFiles
        ]);
    }
}
