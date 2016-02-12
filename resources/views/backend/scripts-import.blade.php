<script src="js/jquery/jquery.min.js"></script>
<script src="js/angular2/bundles/angular2-polyfills.js"></script>
<script src="js/systemjs/dist/system.src.js"></script>
<script src="js/rxjs/bundles/Rx.js"></script>
<script src="js/angular2/bundles/angular2.dev.js"></script>
<script src="js/bootstrap/bootstrap.min.js"></script>

<script>
    System.config({
        'baseURL': 'js/',
        'defaultJSExtensions': true,
        'packages': {
            'typescript': {
                format: 'register',
                defaultExtension: 'js'
            },
            'underscore': {
                defaultExtension: 'js'
            }
        }
    });

    System.import('typescript/boot').then(null, console.error.bind(console));
</script>