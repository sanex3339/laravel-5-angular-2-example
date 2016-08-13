<!DOCTYPE html>
<html>
    <head>
        <title>Laravel 5 + Angular 2 Example</title>
        <link rel="stylesheet" href="/css/app.css">
        <base href="/"/>
    </head>
    <body>

        @yield('layout')

        @if (Config::get('app.debug'))
            <script type="text/javascript">
                document.write('<script src="//localhost:35729/livereload.js?snipver=1" type="text/javascript"><\/script>')
            </script>
        @endif
    </body>
</html>
