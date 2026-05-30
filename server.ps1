# KOFRANO Web Server — Bypasses browser CORS for 3D model loading
# Run this script to test the site locally at http://localhost:8080

$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Champagne
    Write-Host "  KOFRANO Luxury Web Experience Server started" -ForegroundColor Green
    Write-Host "  Local Address: http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "  Press Ctrl+C in this terminal to stop the server" -ForegroundColor Yellow
    Write-Host "=============================================="
    Write-Host ""
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Clean path and combine
        $cleanPath = $urlPath.Replace("/", "\").TrimStart('\')
        $filePath = Join-Path (Get-Location) $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Match MIME types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".glb"  { "model/gltf-binary" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200 OK] Served: $urlPath ($mime)" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[404 Not Found] Request for: $urlPath" -ForegroundColor Red
        }
        $response.Close()
    }
}
catch {
    Write-Host "Server encountered an error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
}
