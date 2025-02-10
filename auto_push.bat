@echo off

REM Vai nella cartella del progetto (se non sei già lì)
cd /d "C:\path\to\your\project"

REM Aggiungi tutte le modifiche
git add .

REM Crea un commit con un messaggio personalizzato
git commit -m "Automated commit %date% %time%"

REM Esegui il push al repository remoto
git push origin main
