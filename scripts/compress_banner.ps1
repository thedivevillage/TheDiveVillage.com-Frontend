Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Sonia\Desktop\TDV\TheDiveVillage-Frontend\Frontend\src\assets\Media\banner.jpg"
$dest = "C:\Users\Sonia\Desktop\TDV\TheDiveVillage-Frontend\Frontend\src\assets\Media\banner_opt.jpg"

$img = [System.Drawing.Image]::FromFile($src)
$newW = [int]($img.Width * 0.7)
$newH = [int]($img.Height * 0.7)

$bmp = New-Object System.Drawing.Bitmap($newW, $newH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $newW, $newH)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80)

$bmp.Save($dest, $codec, $encoderParams)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()

$mb = (Get-Item $dest).Length / 1MB
Write-Host "Optimized banner successfully saved: $mb MB"
