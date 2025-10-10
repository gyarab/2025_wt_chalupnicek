 # Referáty 2.F

 Tento adresář obsahuje jednoduchý web vygenerovaný pomocí MkDocs s referáty studentů 2.F předmětu Webové technologie ve školním roce 2025/2026.
 

## Jak spustit lokálně

    1. Vytvořte virtuální prostředí (pokud ještě nemáte):
    
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

    2. Nainstalujte závislosti:
    
        ```bash
        pip install -r requirements.txt
        ```

    3. Spusťte lokální server:
    
        ```bash
        mkdocs serve
        ```

    4. Otevřete webový prohlížeč a přejděte na adresu `http://localhost:8000`.
    5. Po dokončení práci zastavte server (Ctrl+C) a deaktivujte virtuální prostředí:
    
        ```bash
        deactivate
        ```

## Jak nasadit na GitHub Pages

    1. Ujistěte se, že máte nainstalované závislosti a jste v aktivovaném virtuálním prostředí.
    2. Spusťte příkaz pro nasazení:
    
        ```bash
        mkdocs gh-deploy
        ```
    
    3. Web bude nasazen na GitHub Pages. <http://gyarab.github.io/2025_wt_chalupnicek/>

## Jak aktualizovat obsah
    
    1. Upravte soubor `download_pages.py` podle potřeby (např. přidání nových repozitářů v `repo_list.txt`).
    2. Spusťte skript pro stažení a generování stránek:

        ```bash
        python3 download_pages.py
        ```

    3. Zkontrolujte změny, přidejte je do Git a proveďte commit:

        ```bash
        git add .
        git commit -m "Aktualizace referátů"
        ```

    4. Pushněte změny na GitHub:    

        ```bash
        git push origin main
        ```

    5. Nasazení na GitHub Pages (viz výše).