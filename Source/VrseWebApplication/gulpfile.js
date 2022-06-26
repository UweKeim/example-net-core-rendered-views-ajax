/// <binding BeforeBuild='' AfterBuild='' ProjectOpened='_start' />

/*
    Nach Checkout auf anderem Entwickler-PC:

    1. Node.js muss auf dem PC installiert sein.

    2. In Package Manager Console oder in CMD.EXE (aktueller Pfad auf PARENT-Ordner von dem Ordner, in dem diese Datei hier liegt,
       also demselben Ordner, in dem "package.json" liegt) den Befehl "npm install" ausführen.

    3. In Package Manager Console oder in CMD.EXE (aktueller Pfad auf PARENT-Ordner von dem Ordner, in dem diese Datei hier liegt,
       also demselben Ordner, in dem "package.json" liegt) den Befehl "npm install npm-check-updates -g" um den Update-Checker
       zu installieren.

    4. Falls neue Plugins benötigt werden, sollen diese mit "npm install [Packagename] --save-dev" installiert werden.
       >> Durch "--save-dev" wird ein Eintrag in der package.json Datei hinterlegt. Das in Package Manager Console oder in CMD.EXE
       (aktueller Pfad auf PARENT-Ordner von dem Ordner, in dem diese Datei hier liegt, also demselben Ordner, in dem "package.json"
       liegt) ausführen.
*/

// --------------------------------------------------------------------------
// Includes.

var gulp = require("gulp");
var run = require("gulp-run");
var minifyCSS = require("gulp-clean-css");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var sass = require("gulp-sass")(require("sass"));
var minifyJS = require("gulp-uglify");
var merge = require("merge-stream");

const replace = require('gulp-replace');
const log = require('fancy-log');
const path = require("path");

// --

/*

Nachfolgender Code ersetzt die Gulp-Modul-Aufrufe der Funktionen "rewriteCSS" und "makeCssUrlVersion".

Martin Thumm schreibt mir dazu am 07.02.2022:

    ~~~~~~~~~~~~~
    Das liegt an 2 veralteten Gulp-Imports, ich habe da einfach eigene Funktionen geschrieben
    (https://git.zeta-sw.com/km/verfahren/-/blob/main/_Themes/Source/KM.Theme.3.0/gulpfile.js):

     - version  
     - rewriteUrls

    Die alten Versionen berücksichtigen irgendwie die data-urls von DevExtreme nicht korrekt und fügen dort 
    eine Version hinzu oder ändern die URL ab. Das führt dann zu einer fehlerhaften CSS-Syntax.
    ~~~~~~~~~~~~~

Es sind also folgende neuen Gulp-/NPM-Module zu installieren:

 - gulp-uglify
 - gulp-replace
 - fancy-log
 - path

Und folgende Gulp-/NPM-Module können entfernt werden ("npm uninstall <package-name>"):

 - gulp-rewrite-css
 - gulp-make-css-url-version

*/

const v = "?v=" + (new Date().toISOString().replace(/[^0-9]/g, ""));
const regExLocalUrls = /url\((?!['"]?(?:data:|https?:|%+|\/\/))(['"]?)([^'")]*)\1\)/ig;

const version = function (opts) {
    return replace(regExLocalUrls,
        function handleReplace(match) {
            var url = match.replace(/url\((['"]?)/ig, "").replace(/(['"]?)\)/ig, "");

            var indexHash = url.indexOf("#");

            var outer = match.replace(url, "{0}");
            var newUrl = indexHash < 0 ? url + v : url.substring(0, indexHash) + v + url.substring(indexHash);
            var rewrite = outer.replace("{0}", newUrl);

            if (opts && opts.debug) log(`rewrite ${match} to ${rewrite}`);

            return rewrite;
        });
}

const rewriteUrls = function (opts) {
    return replace(regExLocalUrls,
        function handleReplace(match) {
            var url = match.replace(/url\((['"]?)/ig, "").replace(/(['"]?)\)/ig, "");

            var fileSource = path.resolve(this.file.base, url);
            var fileDestination = path.resolve(this.file.cwd, opts.destination);

            var outer = match.replace(url, "{0}");
            var newUrl = path.relative(fileDestination, fileSource).split(path.sep).join("/");
            var rewrite = outer.replace("{0}", newUrl);

            if (opts.debug) log(`rewrite ${match} to ${rewrite}`);

            return rewrite;
        });
}

// --------------------------------------------------------------------------
// Kopieren nach "wwwroot".

gulp.task("copy",
    function () {
        return merge(
            gulp.src([
                "./content/**/*.js"
            ]).pipe(gulp.dest("./wwwroot/js")),

            gulp.src([
                "./content/**/*.css"
            ]).pipe(gulp.dest("./wwwroot/css"))
        );
    });

gulp.task("copy-libs",
    gulp.series("copy", // Anderen Task zuerst aufrufen.
        function () {
            return merge(
                // jQuery
                gulp.src([
                    "./../node_modules/jquery/dist/jquery.js",
                    "./../node_modules/jquery/dist/jquery.min.js",
                    "./../node_modules/jquery/dist/jquery.min.map"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery")),

                // Cldr
                gulp.src([
                    "./../node_modules/cldrjs/dist/cldr.js"
                ]).pipe(gulp.dest("./wwwroot/lib/cldrjs")),
                gulp.src([
                    "./../node_modules/cldrjs/dist/cldr/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/cldrjs/cldr")),

                // Globalize
                gulp.src([
                    "./../node_modules/globalize/dist/**/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/globalize")),

                // JQuery-Validation
                gulp.src([
                    "./../node_modules/jquery-validation/dist/jquery.validate.js",
                    "./../node_modules/jquery-validation/dist/jquery.validate.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery-validation")),
                gulp.src([
                    "./../node_modules/jquery-validation-unobtrusive/dist/jquery.validate.unobtrusive.js",
                    "./../node_modules/jquery-validation-unobtrusive/dist/jquery.validate.unobtrusive.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery-validation-unobtrusive")),
                gulp.src([
                    "./../node_modules/jquery-validation-globalize/jquery.validate.globalize.js",
                    "./../node_modules/jquery-validation-globalize/jquery.validate.globalize.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery-validation-globalize")),

                // JQuery-Ajax
                gulp.src([
                    "./../node_modules/jquery-ajax-unobtrusive/dist/jquery.unobtrusive-ajax.js",
                    "./../node_modules/jquery-ajax-unobtrusive/dist/jquery.unobtrusive-ajax.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery-ajax-unobtrusive")),

                // jQuery UI.
                gulp.src([
                    "./../node_modules/jquery-ui-dist/jquery-ui.js",
                    "./../node_modules/jquery-ui-dist/jquery-ui.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jquery-ui")),

                // Bootstrap - JS
                gulp.src([
                    "./../node_modules/bootstrap/dist/js/bootstrap.js",
                    "./../node_modules/bootstrap/dist/js/bootstrap.js.map",
                    "./../node_modules/bootstrap/dist/js/bootstrap.min.js",
                    "./../node_modules/bootstrap/dist/js/bootstrap.min.js.map"
                ]).pipe(gulp.dest("./wwwroot/lib/bootstrap")),

                // Bootstrap - CSS
                gulp.src([
                    "./../node_modules/bootstrap/dist/css/bootstrap.css",
                    "./../node_modules/bootstrap/dist/css/bootstrap.css.map",
                    "./../node_modules/bootstrap/dist/css/bootstrap.min.css",
                    "./../node_modules/bootstrap/dist/css/bootstrap.min.css.map"
                ]).pipe(gulp.dest("./wwwroot/lib/bootstrap")),

                // Bootstrap-Icons
                // https://icons.getbootstrap.com/#icons
                // https://icons.getbootstrap.com/#usage
                gulp.src([
                    "./../node_modules/bootstrap-icons/font/bootstrap-icons.css"
                ]).pipe(gulp.dest("./wwwroot/lib/bootstrap-icons")),
                gulp.src([
                    "./../node_modules/bootstrap-icons/font/fonts/*"
                ]).pipe(gulp.dest("./wwwroot/lib/bootstrap-icons/fonts")),

                // Popper.js
                gulp.src([
                    "./../node_modules/@popperjs/core/dist/umd/popper.js",
                    "./../node_modules/@popperjs/core/dist/umd/popper.js.map",
                    "./../node_modules/@popperjs/core/dist/umd/popper.min.js",
                    "./../node_modules/@popperjs/core/dist/umd/popper.min.js.map"
                ]).pipe(gulp.dest("./wwwroot/lib/popperjs")),

                // DevExtreme - CSS
                gulp.src([
                    "./../node_modules/devextreme/dist/css/fonts/*"
                ]).pipe(gulp.dest("./wwwroot/lib/devextreme/css/fonts")),
                gulp.src([
                    "./../node_modules/devextreme/dist/css/icons/*"
                ]).pipe(gulp.dest("./wwwroot/lib/devextreme/css/icons")),
                gulp.src([
                    "./../node_modules/devextreme/dist/css/dx.common.css",
                    "./../node_modules/devextreme/dist/css/dx.light.css",
                    "./../node_modules/devextreme/dist/css/dx.dark.css"
                ]).pipe(gulp.dest("./wwwroot/lib/devextreme/css")),

                // DevExtreme - JS
                gulp.src([
                    "./../node_modules/devextreme/dist/js/dx.all.js",
                    "./../node_modules/devextreme/dist/js/dx.aspnet.mvc.js",
                    "./../node_modules/devextreme-aspnet-data/js/dx.aspnet.data.js",
                    "./../node_modules/devextreme-quill/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/devextreme/js")),

                // DevExtreme - JS localizations.
                gulp.src([
                    "./../node_modules/devextreme/dist/js/localization/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/devextreme/js/localization")),

                // Sweetalert2
                gulp.src([
                    "./../node_modules/sweetalert2/dist/sweetalert2.all.js",
                    "./../node_modules/sweetalert2/dist/sweetalert2.all.min.js",
                    "./../node_modules/sweetalert2/dist/sweetalert2.js",
                    "./../node_modules/sweetalert2/dist/sweetalert2.min.js",
                    "./../node_modules/sweetalert2/dist/sweetalert2.css",
                    "./../node_modules/sweetalert2/dist/sweetalert2.min.css"
                ]).pipe(gulp.dest("./wwwroot/lib/sweetalert2")),

                // Sortable
                gulp.src([
                    "./../node_modules/sortablejs/Sortable.js",
                    "./../node_modules/sortablejs/Sortable.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/sortablejs")),

                // SimpleMDE
                gulp.src([
                    "./../node_modules/simplemde/dist/simplemde.min.css",
                    "./../node_modules/simplemde/dist/simplemde.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/simplemde")),

                // Toastr
                gulp.src([
                    "./../node_modules/toastr/build/*"
                ]).pipe(gulp.dest("./wwwroot/lib/toastr")),

                // Darkreader
                gulp.src([
                    "./../node_modules/darkreader/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/darkreader")),

                // Clipboard
                gulp.src([
                    "./../node_modules/clipboard/dist/clipboard.js",
                    "./../node_modules/clipboard/dist/clipboard.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/clipboard")),

                // SignalR
                gulp.src([
                    "./../node_modules/@aspnet/signalr/dist/browser/signalr.js",
                    "./../node_modules/@aspnet/signalr/dist/browser/signalr.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/signalr")),

                // Promise Polyfill
                gulp.src([
                    "./../node_modules/promise-polyfill/dist/polyfill.js",
                    "./../node_modules/promise-polyfill/dist/polyfill.min.js"
                ]).pipe(gulp.dest("./wwwroot/lib/promise-polyfill")),

                // Turndown
                gulp.src([
                    "./../node_modules/turndown/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/turndown")),

                // Turndown
                gulp.src([
                    "./../node_modules/showdown/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/showdown")),

                // ExcelJS
                gulp.src([
                    "./../node_modules/exceljs/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/exceljs")),

                // FileSaver
                gulp.src([
                    "./../node_modules/file-saver/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/file-saver")),

                // JSZip
                gulp.src([
                    "./../node_modules/jszip/dist/*.js"
                ]).pipe(gulp.dest("./wwwroot/lib/jszip")),

                //// Noty
                //gulp.src([
                //    "./../node_modules/noty/src/**/*.css",
                //    "./../node_modules/noty/src/*.js",
                //]).pipe(gulp.dest("./wwwroot/lib/noty")),
            );
        }));

// --------------------------------------------------------------------------
// JavaScript.

// --------------------------------------------------------------------------
// CSS.

gulp.task("sass",
    function () {
        return gulp.src("./content/vrse.scss")
            .pipe(sass().on("error", sass.logError))
            .pipe(rewriteUrls({ destination: "./wwwroot/css/", debug: true }))
            .pipe(gulp.dest("./wwwroot/css/"));
    });

gulp.task("minify-dx-light",

    // TODO: 2021-12-18, Uwe Keim: Das hier macht wohl irgendetwas kaputt, das "dx.light.min.css" ist aktuell nicht nutzbar.

    function () {
        return gulp.src([
            "./wwwroot/lib/devextreme/css/dx.light.css"
        ])
            .pipe(concat("dx.light.css"))
            .pipe(rewriteUrls({ destination: "./wwwroot/css/", debug: true }))
            .pipe(gulp.dest("./wwwroot/css/"))
            .pipe(minifyCSS({ level: { 1: { specialComments: 0 } } }))
            .pipe(version({ debug: true }))
            .pipe(rename({ suffix: ".min" }))
            .pipe(gulp.dest("./wwwroot/css/"));
    });

gulp.task("minify-css",
    gulp.series(
        "sass", // Anderen Task zuerst aufrufen.
        "minify-dx-light", // Anderen Task zuerst aufrufen.
        function () {
            return gulp.src([
                /*
                 * Bootstrap ist zurzeit auskommentiert, weil wir
                 * wie in https://getbootstrap.com/docs/5.0/customize/sass/ beschrieben
                 * Das Bootstrap bei uns includen, um z. B. auf Farben zuzugreifen, usw.
 
                // Bootstrap.
                "./wwwroot/lib/bootstrap/bootstrap.css",
                */

                // Meine eigenen CSS.
                "./wwwroot/css/vrse.css"

                /*
                 * DevExtreme jetzt auch mal auskommentiert, um auch selbst
                 * in meinem SCSS zu includen.
 
                // DevExtreme.
                "./wwwroot/lib/devextreme/css/dx.common.css",
                */
            ])
                .pipe(concat("bundle.css"))
                .pipe(rewriteUrls({ destination: "./wwwroot/css/", debug: true }))
                .pipe(gulp.dest("./wwwroot/css/"))
                .pipe(minifyCSS({ level: { 1: { specialComments: 0 } } }))
                .pipe(version({ debug: true }))
                .pipe(rename({ suffix: ".min" }))
                .pipe(gulp.dest("./wwwroot/css/"));
        }));

// --------------------------------------------------------------------------
// Watch-Tasks.

gulp.task("watch-js",
    function () {
        return gulp.watch([
            "./content/**/*.js",
            "./content/**/*.ts",
            "./../node_modules/**/*.js",
            "./../node_modules/**/*.ts"
        ],
            gulp.series("copy-libs"));
    });

gulp.task("watch-css",
    function () {
        return gulp.watch([
            "./content/**/*.css",
            "./content/**/*.scss",
            "./../node_modules/**/*.css",
            "./../node_modules/**/*.scss"
        ],
            gulp.series("copy-libs", gulp.parallel("minify-css")));
    });

// --------------------------------------------------------------------------
// Update-Tasks.

gulp.task("update-npm",
    gulp.series(function () {
        return run("npm run update").exec();
    },
        "copy-libs",
        gulp.parallel("minify-css")));

// --------------------------------------------------------------------------
// Ein paar Abkürzungen.

gulp.task("_start", gulp.series("update-npm", gulp.parallel("watch-js", "watch-css")));

gulp.task("_quick", gulp.series("copy-libs", gulp.parallel("minify-css")));
gulp.task("all", gulp.series("update-npm"/*, 'copy-libs', gulp.parallel('minify-css')*/));

// --------------------------------------------------------------------------
