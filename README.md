# Tampermonkey-scripts
Verzameling van mijn persoonlijke Tampermonkey scripts.

## Bol.com - LLM zoekopdracht suggestie script met GPT-4

![Versie](https://img.shields.io/badge/versie-1.3-blue)

### Over dit script
Dit script voegt AI-gegenereerde alternatieve zoeksuggesties toe bij het zoeken op Bol.com. Wanneer je zoekt naar producten op Bol.com, zal het script een alternatieve zoekterm voorstellen die je zou kunnen gebruiken om vergelijkbare of relevante producten te vinden.

De suggesties worden gegenereerd door het GPT-4o-mini model van OpenAI, dat een groot taalmodel is dat creatieve en relevante alternatieven kan bedenken.

![Voorbeeld van een zoeksuggestie](https://via.placeholder.com/600x100?text=Voorbeeld+van+een+zoeksuggestie)

### Kenmerken
- Toont automatisch alternatieve zoeksuggesties bij Bol.com zoekopdrachten
- Mooie, geïntegreerde UI die past bij de stijl van Bol.com
- Gebruikt OpenAI's GPT-4o-mini model voor intelligente suggesties
- Caching van suggesties voor herhaalde zoekopdrachten
- Info-icoon met uitleg over de functionaliteit
- Werkt met SPA (Single Page Application) navigatie binnen Bol.com

### Vereisten
- Een browser met de [Tampermonkey](https://www.tampermonkey.net/) extensie geïnstalleerd
- Een OpenAI API sleutel (wordt bij eerste gebruik gevraagd)

### Installatie
1. Zorg ervoor dat je Tampermonkey hebt geïnstalleerd in je browser
2. [Klik hier om het script te installeren](https://github.com/bartbellefroid/tampermonkey-scripts/raw/main/bol%20-%20experiment%20-%20search%20input%20suggestion%20with%20GPT.js)
3. Tampermonkey zal automatisch het installatiescherm openen
4. Klik op "Installeren" om het script te activeren
5. Bij het eerste gebruik op Bol.com zal het script vragen om je OpenAI API sleutel

### Gebruik
1. Ga naar [Bol.com](https://www.bol.com)
2. Zoek naar een product van je keuze
3. Op de zoekresultaten pagina zie je automatisch een blauw blok met een AI-gegenereerde alternatieve zoekterm
4. Klik op de voorgestelde term om een nieuwe zoekopdracht met die term uit te voeren
5. Klik op het "i" icoon in de rechterbovenhoek voor meer informatie over het script

### Privacy & Veiligheid
- Je OpenAI API sleutel wordt lokaal opgeslagen in je browser (via Tampermonkey's GM_setValue)
- De script maakt alleen verbinding met de OpenAI API om suggesties te genereren
- Er worden geen gegevens verzameld of gedeeld met derden

### Bijdragen
Voel je vrij om issues te melden of verbeteringen voor te stellen via GitHub issues of pull requests.

### Disclaimer
Dit is een experimenteel script en is niet officieel geassocieerd met Bol.com of OpenAI.

### Licentie
[MIT License](LICENSE)
