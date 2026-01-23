[CmdletBinding()]
param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

function Write-Log {
  param([string]$Message)
  Write-Host "==> $Message"
}

function Write-Fail {
  param([string]$Message)
  Write-Error -ErrorAction Continue "error: $Message"
}

function Require-Command {
  param([string]$Name, [string]$Hint)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Fail "Missing required command: $Name. $Hint"
    return $false
  }
  return $true
}

function Get-RepoRoot {
  $root = Get-Item -LiteralPath (Join-Path $PSScriptRoot '..')
  return $root.FullName
}

function Ensure-EnvLocal {
  if (-not (Test-Path -LiteralPath '.env.local')) {
    if (Test-Path -LiteralPath '.env.example') {
      Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
      Write-Log 'Created .env.local from .env.example'
    } else {
      @(
        'NEXT_PUBLIC_SUPABASE_URL=',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY='
      ) | Set-Content -LiteralPath '.env.local'
      Write-Log 'Created .env.local with placeholders'
    }
  } else {
    Write-Log '.env.local already exists'
  }
}

function Trim-EnvValue {
  param([string]$Value)
  if ($null -eq $Value) { return '' }
  return $Value.Trim().Trim("`r").Trim("`n")
}

function Parse-EnvLine {
  param([string]$Line)

  $raw = $Line.TrimEnd("`r")
  $trimmed = $raw.Trim()

  if ($trimmed.Length -eq 0) { return $null }
  if ($trimmed.StartsWith('#')) { return $null }

  $match = [regex]::Match($raw, '^\s*([^=]+?)\s*=\s*(.*)\s*$')
  if (-not $match.Success) { return $null }

  $key = $match.Groups[1].Value.Trim()
  $value = $match.Groups[2].Value.Trim()

  if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))) {
    if ($value.Length -ge 2) {
      $value = $value.Substring(1, $value.Length - 2)
    }
  }

  return [pscustomobject]@{ Key = $key; Value = $value }
}

function Import-DotEnv {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) { return }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $entry = Parse-EnvLine $_
    if ($null -ne $entry -and -not [string]::IsNullOrWhiteSpace($entry.Key)) {
      Set-Item -Path ("Env:{0}" -f $entry.Key) -Value $entry.Value
    }
  }
}

function Test-RequiredEnv {
  param([string]$Name, [string]$Placeholder)

  $value = (Get-Item -Path ("Env:{0}" -f $Name) -ErrorAction SilentlyContinue).Value
  $value = Trim-EnvValue $value

  if ([string]::IsNullOrWhiteSpace($value)) { return $false }
  if ($value -eq $Placeholder) { return $false }
  return $true
}

try {
  $rootDir = Get-RepoRoot
  Set-Location -LiteralPath $rootDir
} catch {
  Write-Fail "Failed to resolve repo root from $PSScriptRoot"
  exit 1
}

Write-Log 'Checking prerequisites...'
$ok = $true
$ok = (Require-Command 'bun' 'Install Bun for Windows and ensure it is on PATH: https://bun.sh/docs/installation#windows') -and $ok
$ok = (Require-Command 'git' 'Install Git for Windows and ensure it is on PATH: https://git-scm.com/download/win') -and $ok
if (-not $ok) { exit 1 }

Ensure-EnvLocal

Import-DotEnv '.env.local'

$missing = $false
$missing = -not (Test-RequiredEnv 'NEXT_PUBLIC_SUPABASE_URL' 'https://your-project.supabase.co') -or $missing
$missing = -not (Test-RequiredEnv 'NEXT_PUBLIC_SUPABASE_ANON_KEY' 'your-anon-key') -or $missing

if ($missing) {
  Write-Fail 'Missing required env vars in .env.local. This is expected on first run.'
  Write-Log 'Edit .env.local and set:'
  Write-Log '  - NEXT_PUBLIC_SUPABASE_URL'
  Write-Log '  - NEXT_PUBLIC_SUPABASE_ANON_KEY'
  Write-Log 'Then re-run ./scripts/setup.ps1'
  exit 1
}

if (-not $SkipInstall) {
  Write-Log 'Installing dependencies...'
  & bun install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Log 'Skipping dependency install (-SkipInstall set)'
}

Write-Log 'Running setup verification...'
& bun run setup:verify
$code = $LASTEXITCODE
if ($code -eq 0) {
  Write-Log 'Setup complete'
}
exit $code
