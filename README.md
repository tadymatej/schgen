# Postup pro spuštění aplikace na localhostu:
## Operační systém linux: (preferovaný OS)
1) Nainstalujte si python pomocí: sudo apt install python3
3) Přesuňte se do složky s projektem
4) Spusťte lokální http server pomocí příkazu: python3 -m http.server 8080 --bind 127.0.0.1
5) Otevřete google chrome prohlížeč pomocí příkazu: google-chrome 127.0.0.1:8080, nebo otevřete libovolný jiný webový prohlížeč a jako URL zadejte: 127.0.0.1:8080

## Operační systém windows:
1) Nainstalujte si python: https://www.python.org/downloads/
2) Přesuňtese do složky s projektem
3) Spusťte následující příkaz: python3 -m http.server 8080 --bind 127.0.0.1
3b) Pokud předchozí krok nefungoval, můžete zkusit následující příkaz:
python3 -m http.server 8080
4) Otevřete libovolný jiný webový prohlížeč a jako URL zadejte: 127.0.0.1:8080
Více informací na adrese: https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server

## Webová aplikace je také k dispozici na adrese:
https://fit-schgen.000webhostapp.com
