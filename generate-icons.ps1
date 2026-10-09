Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "logotipoapp.jpg"
$resDir = Join-Path $PSScriptRoot "android\app\src\main\res"

if (-not (Test-Path $srcPath)) {
    Write-Error "logotipoapp.jpg não encontrado!"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Imagem carregada: $($srcImage.Width)x$($srcImage.Height)"

$densities = @(
    @{ Name = "mdpi"; Size = 48; FgSize = 108 },
    @{ Name = "hdpi"; Size = 72; FgSize = 162 },
    @{ Name = "xhdpi"; Size = 96; FgSize = 216 },
    @{ Name = "xxhdpi"; Size = 144; FgSize = 324 },
    @{ Name = "xxxhdpi"; Size = 192; FgSize = 432 }
)

function Create-ResizedBitmap($source, $width, $height, [bool]$circular, [bool]$darkBackground) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($darkBackground) {
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 19, 32)) # #0B1320
        $g.FillRectangle($brush, 0, 0, $width, $height)
        $brush.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    if ($circular) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $g.SetClip($path)
        $g.DrawImage($source, 0, 0, $width, $height)
        $path.Dispose()
    } else {
        $g.DrawImage($source, 0, 0, $width, $height)
    }

    $g.Dispose()
    return $bmp
}

function Create-ForegroundBitmap($source, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $contentSize = [int]($width * 0.72)
    $offset = [int](($width - $contentSize) / 2)

    $g.DrawImage($source, $offset, $offset, $contentSize, $contentSize)
    $g.Dispose()
    return $bmp
}

function Create-SplashBitmap($source, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 19, 32)) # #0B1320
    $g.FillRectangle($brush, 0, 0, $width, $height)
    $brush.Dispose()

    $minDim = [Math]::Min($width, $height)
    $logoSize = [int]($minDim * 0.45)
    $offsetX = [int](($width - $logoSize) / 2)
    $offsetY = [int](($height - $logoSize) / 2)

    $g.DrawImage($source, $offsetX, $offsetY, $logoSize, $logoSize)
    $g.Dispose()
    return $bmp
}

# 1. Ícones do Launcher
foreach ($d in $densities) {
    $targetDir = Join-Path $resDir "mipmap-$($d.Name)"
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $bmpSquare = Create-ResizedBitmap $srcImage $d.Size $d.Size $false $true
    $bmpSquare.Save((Join-Path $targetDir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpSquare.Dispose()

    $bmpRound = Create-ResizedBitmap $srcImage $d.Size $d.Size $true $true
    $bmpRound.Save((Join-Path $targetDir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpRound.Dispose()

    $bmpFg = Create-ForegroundBitmap $srcImage $d.FgSize $d.FgSize
    $bmpFg.Save((Join-Path $targetDir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpFg.Dispose()

    Write-Host "Ícones mipmap-$($d.Name) gerados com sucesso."
}

# 2. Splash Screens
$splashes = @(
    @{ Dir = "drawable"; W = 480; H = 800 },
    @{ Dir = "drawable-port-mdpi"; W = 320; H = 480 },
    @{ Dir = "drawable-port-hdpi"; W = 480; H = 800 },
    @{ Dir = "drawable-port-xhdpi"; W = 720; H = 1280 },
    @{ Dir = "drawable-port-xxhdpi"; W = 960; H = 1600 },
    @{ Dir = "drawable-port-xxxhdpi"; W = 1280; H = 1920 },
    @{ Dir = "drawable-land-mdpi"; W = 480; H = 320 },
    @{ Dir = "drawable-land-hdpi"; W = 800; H = 480 },
    @{ Dir = "drawable-land-xhdpi"; W = 1280; H = 720 },
    @{ Dir = "drawable-land-xxhdpi"; W = 1600; H = 960 },
    @{ Dir = "drawable-land-xxxhdpi"; W = 1920; H = 1280 }
)

foreach ($s in $splashes) {
    $targetDir = Join-Path $resDir $s.Dir
    if (Test-Path $targetDir) {
        $bmpSplash = Create-SplashBitmap $srcImage $s.W $s.H
        $bmpSplash.Save((Join-Path $targetDir "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmpSplash.Dispose()
        Write-Host "Splash screen em $($s.Dir) gerada ($($s.W)x$($s.H))."
    }
}

# 3. Ícones PWA
$web192 = Create-ResizedBitmap $srcImage 192 192 $false $true
$web192.Save((Join-Path $PSScriptRoot "public\icon-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$web192.Dispose()

$web512 = Create-ResizedBitmap $srcImage 512 512 $false $true
$web512.Save((Join-Path $PSScriptRoot "public\icon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$web512.Dispose()

$srcImage.Dispose()
Write-Host "Sucesso total na geração de Ícones e Splash Screens!"
