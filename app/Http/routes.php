<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', [
    function () {
        return view('backend.content');
    },
    'as' => 'home'
]);

// angular 2 templates route
Route::get('/templates/{template}', [
    'uses' => 'BannersCreator\AngularTemplatesController@index',
    'as' => 'AngularTemplatesRoute'
]);

Route::post('/api/upload-file', [
    'middleware' => 'cors',
    'uses' => 'BannersCreator\UploadController@uploadFile',
    'as' => 'ApiUploadFile']
);

Route::get('/edit', [
    'uses' => 'BannersCreator\AngularTemplatesController@editTemplates',
    'as' => 'EditTemplates'
]);

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['middleware' => ['web']], function () {
    //
});
