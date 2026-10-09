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

# Também criar o foreground para adaptive icon (o logo centralizado ocupando ~72% para não cortar na máscara adaptativa)
function Create-ForegroundBitmap($source, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Margem segura do adaptive icon: safe zone é 66-72%
    $contentSize = [int]($width * 0.72)
    $offset = [int](($width - $contentSize) / 2)

    $g.DrawImage($source, $offset, $offset, $contentSize, $contentSize)
    $g.Dispose()
    return $bmp
}

foreach ($d in $densities) {
    $targetDir = Join-Path $resDir "mipmap-$($d.Name)"
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    # 1. ic_launcher.png (Quadrado / Fundo escuro)
    $bmpSquare = Create-ResizedBitmap $srcImage $d.Size $d.Size $false $true
    $bmpSquare.Save((Join-Path $targetDir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpSquare.Dispose()

    # 2. ic_launcher_round.png (Circular)
    $bmpRound = Create-ResizedBitmap $srcImage $d.Size $d.Size $true $true
    $bmpRound.Save((Join-Path $targetDir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpRound.Dispose()

    # 3. ic_launcher_foreground.png (Adaptive icon)
    $bmpFg = Create-ForegroundBitmap $srcImage $d.FgSize $d.FgSize
    $bmpFg.Save((Join-Path $targetDir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpFg.Dispose()

    Write-Host "Gerados ícones para mipmap-$($d.Name) ($($d.Size)x$($d.Size) e FG $($d.FgSize)x$($d.FgSize))"
}

# Criar também versão web para public/icon-192.png e public/icon-512.png
$web192 = Create-ResizedBitmap $srcImage 192 192 $false $true
$web192.Save((Join-Path $PSScriptRoot "public\icon-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$web192.Dispose()

$web512 = Create-ResizedBitmap $srcImage 512 512 $false $true
$web512.Save((Join-Path $PSScriptRoot "public\icon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$web512.Dispose()

Write-Host "Ícones PWA gerados em public/icon-192.png e icon-512.png"

$srcImage.Dispose()
Write-Host "Sucesso total na geração dos ícones Android e Web!"
