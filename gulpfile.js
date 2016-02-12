var elixir = require('laravel-elixir'),
    elixirTypescript = require('elixir-typescript'),
    livereload = require('laravel-elixir-livereload');

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
     * Angular 2
     **/
    mix.copy('node_modules/angular2', 'public/js/angular2');
    mix.copy('node_modules/rxjs', 'public/js/rxjs');
    mix.copy('node_modules/systemjs', 'public/js/systemjs');
    mix.copy('node_modules/es6-promise', 'public/js/es6-promise');
    mix.copy('node_modules/es6-shim', 'public/js/es6-shim');
    mix.copy('node_modules/zone.js', 'public/js/zone.js');

    /**
     * Less
     **/
    mix.less('app.less');

    /**
     * Typescript
     **/
    mix.typescript('app.js','public/js','/**/*.ts',{
        "target": "ES5",
        "module": "system",
        "baseUrl": '.',
        "moduleResolution": "node",
        "sourceMap": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "removeComments": false,
        "noImplicitAny": false
    });

    mix.livereload([
        'public/css/**/*',
        'public/fonts/**/*',
        'public/js/**/*'
    ]);
});
