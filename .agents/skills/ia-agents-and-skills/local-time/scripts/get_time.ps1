<# 
.SYNOPSIS
    Obtiene la hora del sistema en múltiples formatos.
.DESCRIPTION
    Script PowerShell para obtener la hora local del sistema.
    Compatible con Windows PowerShell 5.1+ y PowerShell Core 7+.
.PARAMETER Format
    Formato de salida: iso, time, date, datetime, unix, full (default: iso)
.EXAMPLE
    .\get_time.ps1 iso
    .\get_time.ps1 time
    .\get_time.ps1 full
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('iso', 'time', 'date', 'datetime', 'unix', 'full')]
    [string]$Format = 'iso'
)

$now = Get-Date
$timezone = [System.TimeZoneInfo]::Local

switch ($Format) {
    'iso' {
        $now.ToString('yyyy-MM-ddTHH:mm:sszzz')
    }
    'time' {
        $now.ToString('HH:mm:ss')
    }
    'date' {
        $now.ToString('yyyy-MM-dd')
    }
    'datetime' {
        $now.ToString('yyyy-MM-dd HH:mm:ss')
    }
    'unix' {
        [int][double]::Parse((Get-Date -UFormat %s))
    }
    'full' {
        $utcOffset = $now.ToString('zzz')
        Write-Output "ISO:      $($now.ToString('yyyy-MM-ddTHH:mm:sszzz'))"
        Write-Output "Date:     $($now.ToString('yyyy-MM-dd'))"
        Write-Output "Time:     $($now.ToString('HH:mm:ss'))"
        Write-Output "DateTime: $($now.ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-Output "Unix:     $([int][double]::Parse((Get-Date -UFormat %s)))"
        Write-Output "Timezone: $($timezone.Id)"
        Write-Output "UTC Offset: $utcOffset"
    }
}
