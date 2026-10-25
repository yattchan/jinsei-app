# Create "jinsei OS" shortcuts on the Desktop and in the Start Menu.
# Usage: powershell -ExecutionPolicy Bypass -File desktop\install-shortcuts.ps1
# Kept ASCII-only: Windows PowerShell 5.1 reads BOM-less UTF-8 as the ANSI code page.
$here = $PSScriptRoot
$electron = Join-Path $here "node_modules\electron\dist\electron.exe"
if (-not (Test-Path $electron)) {
  Write-Host "electron not found. Run npm install in the desktop folder first."
  exit 1
}

$name = [string][char]0x4EBA + [char]0x751F + "OS"  # 人生OS
$shell = New-Object -ComObject WScript.Shell
$targets = @(
  [Environment]::GetFolderPath("Desktop"),
  (Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs")
)
foreach ($dir in $targets) {
  $lnk = $shell.CreateShortcut((Join-Path $dir "$name.lnk"))
  $lnk.TargetPath = $electron
  $lnk.Arguments = "`"$here`""
  $lnk.WorkingDirectory = $here
  $lnk.IconLocation = (Join-Path $here "icon.ico")
  $lnk.Description = $name
  $lnk.Save()
  Write-Host "created: $dir\$name.lnk"
}
