$ProgressPreference = 'SilentlyContinue'
try {
    Write-Host "Querying GitHub API..."
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/stripe/stripe-cli/releases/latest"
    $asset = $release.assets | Where-Object { $_.name -like "*windows_x86_64.zip" }
    
    if (-not $asset) {
        throw "Could not find Windows asset in latest release."
    }

    $url = $asset.browser_download_url
    Write-Host "Downloading from $url..."
    Invoke-WebRequest -Uri $url -OutFile "stripe.zip"
    
    Write-Host "Extracting..."
    Expand-Archive -Path "stripe.zip" -DestinationPath "." -Force
    
    Write-Host "Cleaning up..."
    Remove-Item "stripe.zip"
    
    if (Test-Path ".\stripe.exe") {
        Write-Host "Success! Stripe CLI installed."
        .\stripe.exe --version
    }
    else {
        throw "stripe.exe not found after extraction."
    }
}
catch {
    Write-Error $_
    exit 1
}
