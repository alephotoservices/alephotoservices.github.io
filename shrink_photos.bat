@echo off
set "target_dir=images"

for /r "%target_dir%" %%i in (*.webp) do (
    set "filename=%%~ni"
    
    echo "%%~ni" | findstr /C:"_thumbnail" >nul
    if errorlevel 1 (
        if not exist "%%~dpi%%~ni_thumbnail.webp" (
            ffmpeg -i "%%i" -vf "scale=600:-1" -qscale 80 "%%~dpi%%~ni_thumbnail.webp"
        )
    )
)

pause