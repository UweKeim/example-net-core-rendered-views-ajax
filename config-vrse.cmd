PUSHD 
CD /d %~dp0 

@REM https://stackoverflow.com/a/9588052/107625
setx NODE_PATH %AppData%\npm\node_modules
set NODE_PATH=%AppData%\npm\node_modules

@REM Falls nachfolgendes fehlschlgt, Nodejs LTS fr Windows installieren https://nodejs.org/en/download
@REM und ggf. System neu starten.
call npm update -g
call npm install --global gulp-cli --force
call npm install --global npm-check-updates

@REM Tool zum Aktualisieren von NuGet-Paketen installieren.
@REM https://github.com/dotnet-outdated/dotnet-outdated#installation
@REM Falls der Aufruf fehlschlgt, das .NET SDK installieren von
@REM https://dotnet.microsoft.com/en-us/download/visual-studio-sdks
@REM Bzw. sollte durch das Installieren von Visual Studio bereits das
@REM .NET SDK installiert sein. Dann prfen, ob Visual Studio korrekt
@REM und vollstndig installiert ist.
dotnet tool install --global dotnet-outdated-tool

@REM Das ist von Zeit zu Zeit notwendig, deshalb hier gleich automatisch.
dotnet dev-certs https --trust

@REM Aufräumen, falls schon "node_modules" und/oder "package-lock.json" vorhanden
@REM sind, kann es zu Fehlern im Gulpfile.js geben, siehe auch:
@REM https://github.com/microsoft/TypeScript/issues/51420#issuecomment-1368970292
del "%~dp0\Source\package-lock.json" /Q
rmdir "%~dp0\Source\node_modules" /Q /S

@REM um für "gulpfile.js" und den Task Runner Explorer alles bereit zu haben.
cd "%~dp0\Source"
call npm install

POPD 
EXIT /B 0
