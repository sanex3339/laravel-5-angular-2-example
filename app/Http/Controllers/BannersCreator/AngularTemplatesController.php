<?php

namespace App\Http\Controllers\BannersCreator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Redirect;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AngularTemplatesController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest');
    }

    public function index($template, Request $request)
    {
        $templatePath = 'frontend.' . $template;

        if (view()->exists($templatePath) && !$request->ajax()) {
            return view($templatePath);
        }

        throw new NotFoundHttpException();
    }

    public function editTemplates()
    {
        return Redirect::home();
    }
}
