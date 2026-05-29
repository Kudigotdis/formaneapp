$historyPath = "$env:APPDATA\Code\User\History"
$results = @()

Get-ChildItem -Path $historyPath -Recurse -Filter "entries.json" | ForEach-Object {
    $jsonContent = Get-Content $_.FullName -Raw | ConvertFrom-Json
    if ($jsonContent.resource -match "Foromane%20App%202") {
        # Find the latest entry
        $latestEntry = $jsonContent.entries | Sort-Object timestamp -Descending | Select-Object -First 1
        
        if ($latestEntry) {
            $lastModified = [datetime]::new(1970, 1, 1, 0, 0, 0, [System.DateTimeKind]::Utc).AddMilliseconds($latestEntry.timestamp).ToLocalTime()
            $fileName = [System.Uri]::UnescapeDataString($jsonContent.resource).Split('/')[-1]
            $results += [PSCustomObject]@{
                OriginalFile = $fileName
                LastModified = $lastModified
                HistoryFilePath = Join-Path $_.Directory.FullName $latestEntry.id
                Timestamp = $latestEntry.timestamp
            }
        }
    }
}

$results | Sort-Object Timestamp -Descending | Select-Object -First 20 | Select-Object OriginalFile, LastModified, HistoryFilePath | Format-Table -AutoSize -Wrap
