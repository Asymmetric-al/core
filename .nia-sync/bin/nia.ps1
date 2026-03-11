$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
python (Join-Path $scriptDir 'nia_runner.py') @args