process.env.DISABLE_NOTIFIER = true;

var elixir = require('laravel-elixir'),
    livereload = require('laravel-elixir-livereload'),
    webpack = require('laravel-elixir-webpack-ex');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    /**
     * Bootstrap
     **/
    var bootstrapPath = 'node_modules/bootstrap-less';

    mix.copy(bootstrapPath, 'resources/vendor/bootstrap/');
    mix.copy(bootstrapPath + '/js/bootstrap.min.js', 'public/js/bootstrap');
    mix.copy(bootstrapPath + '/fonts', 'public/fonts');

    /**
     * JQuery
     **/
    mix.copy('node_modules/jquery/dist/jquery.min.js', 'public/js/jquery');

    /**
     * Less
     **/
    mix.less('app.less');

    /**
     * Scripts webpack bundling and copying
     **/
    mix.copy('node_modules/angular2/bundles/angular2-polyfills.js', 'public/js/angular2');

    mix.webpack('app.ts', {
        resolve: {
            extensions: ['', '.js', '.ts']
        },
        module: {
            loaders: [
                { test: /\.ts/, loader: 'ts-loader' }
            ]
        }
    }, 'public/js', 'resources/assets/typescript');

    /**
     * LiveReload
     **/
    mix.livereload([
        'public/css/**/*',
        'public/fonts/**/*',
        'public/js/**/*'
    ]);
});
