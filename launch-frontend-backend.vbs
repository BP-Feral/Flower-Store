Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "code -n .\Frontend", 0, False
WshShell.Run "code -n .\Backend", 0, False