$ProgressPreference = 'SilentlyContinue'
try {
    Write-Host "Fetching latest release info..."
    $web = Invoke-WebRequest -Uri "https://github.com/stripe/stripe-cli/releases/latest" -UseBasicParsing
    $link = $web.Links | Where-Object { $_.href -like "*windows_x86_64.zip" } | Select-Object -First 1 -ExpandProperty href
    
    if (-not $link) {
        throw "Could not find download link."
    }

    $url = "https://github.com" + $link
    Write-Host "Downloading from $url..."
    Invoke-WebRequest -Uri $url -OutFile "stripe.zip"
    
    Write-Host "Extracting..."
    Expand-Archive -Path "stripe.zip" -DestinationPath "." -Force
    
    Write-Host "Cleaning up..."
    Remove-Item "stripe.zip"
    
    if (Test-Path ".\stripe.exe") {
        Write-Host "Success! Stripe CLI installed locally."
        .\stripe.exe --version
    } else {
        throw "Extraction failed."
    }
} catch {
    Write-Error $_
    exit 1
}
