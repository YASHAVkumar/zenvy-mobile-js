Add-Type -AssemblyName System.Drawing

$assetsPath = Join-Path $PSScriptRoot '..\assets'
$cream = '#F6F5F0'
$sage = '#526A4B'
$lime = '#DCEB89'

function Save-ZenvyIcon {
  param(
    [string]$Path,
    [int]$Size,
    [string]$Background,
    [string]$Mark,
    [int]$FontSize,
    [bool]$Circle,
    [bool]$Sparkle
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  if ($Background -eq 'transparent') {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
  }

  if ($Circle) {
    $circleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($sage))
    $inset = [single]($Size * 0.13)
    $diameter = [single]($Size - 2 * $inset)
    $graphics.FillEllipse($circleBrush, $inset, $inset, $diameter, $diameter)
    $circleBrush.Dispose()
  }

  $font = [System.Drawing.Font]::new('Georgia', [single]$FontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $markBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($Mark))
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textBounds = [System.Drawing.RectangleF]::new(0, [single](-$Size * 0.025), $Size, $Size)
  $graphics.DrawString('Z', $font, $markBrush, $textBounds, $format)

  if ($Sparkle) {
    $starPoints = [System.Drawing.PointF[]]::new(8)
    $centerX = [single]($Size * 0.755)
    $centerY = [single]($Size * 0.265)
    for ($index = 0; $index -lt 8; $index++) {
      $angle = (-90 + $index * 45) * [Math]::PI / 180
      $radius = if ($index % 2 -eq 0) { $Size * 0.042 } else { $Size * 0.014 }
      $starPoints[$index] = [System.Drawing.PointF]::new([single]($centerX + [Math]::Cos($angle) * $radius), [single]($centerY + [Math]::Sin($angle) * $radius))
    }
    $sparkleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($lime))
    $graphics.FillPolygon($sparkleBrush, $starPoints)
    $sparkleBrush.Dispose()
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $format.Dispose()
  $markBrush.Dispose()
  $font.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-ZenvyIcon (Join-Path $assetsPath 'icon.png') 1024 $cream '#FFFFFF' 500 $true $true
Save-ZenvyIcon (Join-Path $assetsPath 'android-icon-foreground.png') 1024 'transparent' $cream 500 $false $false
Save-ZenvyIcon (Join-Path $assetsPath 'android-icon-monochrome.png') 432 'transparent' '#FFFFFF' 260 $false $false
Save-ZenvyIcon (Join-Path $assetsPath 'splash-icon.png') 512 $cream $sage 250 $true $true
Save-ZenvyIcon (Join-Path $assetsPath 'favicon.png') 128 $cream '#FFFFFF' 63 $true $true
