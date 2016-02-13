<?php

namespace App\Http\Controllers\ExampleControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AngularTemplatesController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Default action for all Angular 2 templates
     *
     * @param $template
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index($template, Request $request)
    {
        $templatePath = 'frontend.' . $template;

        if (view()->exists($templatePath) && !$request->ajax()) {
            return view($templatePath);
        }

        throw new NotFoundHttpException();
    }
}
