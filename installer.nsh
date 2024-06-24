!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

Function .onInstSuccess
  nsExec::ExecToLog '"$INSTDIR\bin\curl.exe" -o "$INSTDIR\downloadedfile.zip" "https://example.com/yourfile.zip"'
  nsExec::ExecToLog '"$INSTDIR\bin\7z.exe" x "$INSTDIR\downloadedfile.zip" -o"$INSTDIR"'
FunctionEnd
