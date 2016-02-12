<!DOCTYPE html>
<html>
    <head>
        <title>Banners Creator</title>
        <link rel="stylesheet" href="/css/app.css">
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
