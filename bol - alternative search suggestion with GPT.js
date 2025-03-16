// ==UserScript==
// @name         Bol.com - Alternative Search Suggestions with GPT-4
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Shows alternative search suggestions for products on Bol.com using GPT
// @author       Bart Bellefroid, ChatGPT
// @match        *://*.bol.com/*/*/s/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @downloadURL  https://github.com/bartbellefroid/tampermonkey-scripts/raw/main/bol%20-%20alternative%20search%20suggestion%20with%20GPT.js
// @updateURL    https://github.com/bartbellefroid/tampermonkey-scripts/raw/main/bol%20-%20alternative%20search%20suggestion%20with%20GPT.js


// ==/UserScript==

(function() {
    'use strict';

    console.log("Experiment: LLM search input suggestion script started!");
    
    // CSS voor onze UI elementen
    const customStyles = `
        .ai-suggestion-container {
            margin: 15px 0;
            padding: 12px 15px;
            border-radius: 8px;
            background-color: #f5f5f5;
            border-left: 4px solid #0000A4;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-size: 14px;
            line-height: 1.4;
            max-width: 800px;
            position: relative;
        }
        .ai-suggestion-title {
            font-weight: bold;
            color: #0000A4;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
        }
        .ai-suggestion-content {
            margin-top: 8px;
        }
        .ai-suggestion-link {
            color: #0000A4;
            text-decoration: underline;
            font-weight: bold;
        }
        .ai-suggestion-loader {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0,0,164,0.3);
            border-radius: 50%;
            border-top-color: #0000A4;
            animation: ai-spin 1s linear infinite;
            margin-right: 10px;
        }
        .ai-info-icon {
            position: absolute;
            top: 12px;
            right: 15px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #0000A4;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            user-select: none;
        }
        .ai-info-tooltip {
            position: absolute;
            top: -10px;
            right: 30px;
            width: 250px;
            padding: 10px;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            font-size: 12px;
            color: #333;
            z-index: 1000;
            display: none;
        }
        .ai-info-tooltip.visible {
            display: block;
        }
        @keyframes ai-spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    // API sleutel instellen/opvragen
    function getApiKey() {
        let apiKey = GM_getValue('openai_api_key');
        
        if (!apiKey) {
            apiKey = prompt('Voer je OpenAI API sleutel in (wordt lokaal opgeslagen):');
            if (apiKey) {
                GM_setValue('openai_api_key', apiKey);
            }
        }
        
        return apiKey;
    }
    
    // Voeg de stijlen toe aan de pagina
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
    }
    
    // Haal de zoekterm op uit de URL
    function haalZoektermOp() {
        return new URLSearchParams(window.location.search).get('searchtext');
    }
    
    // Voeg de suggestie container toe aan de pagina
    function createSuggestionContainer() {
        const h1Element = document.querySelector('h1');
        if (!h1Element) return null;
        
        const container = document.createElement('div');
        container.className = 'ai-suggestion-container';
        
        const title = document.createElement('div');
        title.className = 'ai-suggestion-title';
        title.innerHTML = '<span class="ai-suggestion-loader"></span>🤖 AI-gebaseerde zoeksuggestie (GPT-4o-mini)';
        container.appendChild(title);
        
        const content = document.createElement('div');
        content.className = 'ai-suggestion-content';
        content.textContent = 'Suggestie laden...';
        container.appendChild(content);
        
        // Info icoon toevoegen
        const infoIcon = document.createElement('div');
        infoIcon.className = 'ai-info-icon';
        infoIcon.textContent = 'i';
        container.appendChild(infoIcon);
        
        // Tooltip voor info icoon
        const tooltip = document.createElement('div');
        tooltip.className = 'ai-info-tooltip';
        tooltip.innerHTML = 'Dit is een Tampermonkey browser extensie die AI-gebaseerde zoeksuggesties toont voor Bol.com. ' +
                           'De suggesties worden gegenereerd door het GPT-4o-mini model van OpenAI.';
        container.appendChild(tooltip);
        
        // Event listener voor het tonen/verbergen van de tooltip
        infoIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            tooltip.classList.toggle('visible');
        });
        
        // Verberg tooltip bij klikken buiten het element
        document.addEventListener('click', function() {
            tooltip.classList.remove('visible');
        });
        
        h1Element.insertAdjacentElement('afterend', container);
        return container;
    }
    
    // Update de suggestie container met nieuwe inhoud
    function updateSuggestionContainer(container, suggestie, isError = false) {
        const titleElement = container.querySelector('.ai-suggestion-title');
        const contentElement = container.querySelector('.ai-suggestion-content');
        
        // Verwijder de loader
        const loader = titleElement.querySelector('.ai-suggestion-loader');
        if (loader) {
            loader.remove();
        }
        
        if (isError) {
            titleElement.innerHTML = '🤖 AI-suggestie niet beschikbaar';
            container.style.borderLeftColor = '#d32f2f';
            contentElement.textContent = suggestie;
            return;
        }
        
        titleElement.innerHTML = '🤖 AI-gebaseerde zoeksuggestie (GPT-4o-mini)';
        contentElement.innerHTML = `Alternatieve zoekterm: <a href="https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(suggestie)}" target="_blank" class="ai-suggestion-link">${suggestie}</a>`;
    }
    
    // Vraag suggestie aan OpenAI API
    function getSuggestionFromOpenAI(zoekterm, container) {
        const apiKey = getApiKey();
        
        if (!apiKey) {
            updateSuggestionContainer(container, 'Geen API sleutel beschikbaar. Herlaad de pagina om opnieuw in te stellen.', true);
            return;
        }
        
        // Check cache voor deze zoekterm
        const cachedSuggestion = GM_getValue(`cache_${zoekterm}`);
        if (cachedSuggestion) {
            console.log("Using cached suggestion for:", zoekterm);
            updateSuggestionContainer(container, cachedSuggestion);
            return;
        }
        
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://api.openai.com/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            data: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        "role": "user",
                        "content": "Geef een alternatieve suggestie om producten te vinden voor de volgende woorden, die te gebruiken bij een Nederlandse e-commerce website: \"" + zoekterm + "\". Antwoord alleen met de zoekterm."
                    }
                ],
                temperature: 1,
                max_tokens: 50,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }),
            onload: function(response) {
                try {
                    const result = JSON.parse(response.responseText);
                    console.log("Succesvol antwoord van chat GPT:", result);
                    
                    if (result.error) {
                        throw new Error(result.error.message || 'Onbekende fout bij API');
                    }
                    
                    let suggestie = result.choices[0].message.content;
                    suggestie = suggestie.replace(/^"|"$/g, '').trim();
                    console.log("Suggestie:", suggestie);
                    
                    // Cache de suggestie
                    GM_setValue(`cache_${zoekterm}`, suggestie);
                    
                    updateSuggestionContainer(container, suggestie);
                } catch (error) {
                    console.error('Fout bij verwerken van API response:', error);
                    updateSuggestionContainer(container, 'Er is een fout opgetreden bij het ophalen van een suggestie: ' + error.message, true);
                }
            },
            onerror: function(error) {
                console.error('Fout bij het aanroepen van de OpenAI API:', error);
                updateSuggestionContainer(container, 'Er is een fout opgetreden bij het aanroepen van de API', true);
            },
            ontimeout: function() {
                console.error('Timeout bij aanroepen van de API');
                updateSuggestionContainer(container, 'Timeout bij het aanroepen van de API', true);
            }
        });
    }
    
    // Hoofdfunctie die alles initialiseert
    function initialize() {
        const zoekterm = haalZoektermOp();
        if (!zoekterm) {
            console.log("Geen zoekterm gevonden in URL");
            return;
        }
        
        console.log("Gevonden zoekterm:", zoekterm);
        addStyles();
        
        const suggestionContainer = createSuggestionContainer();
        if (suggestionContainer) {
            getSuggestionFromOpenAI(zoekterm, suggestionContainer);
        }
    }
    
    // Start het script wanneer de pagina is geladen
    window.addEventListener('load', initialize);
    
    // Ook starten bij URL verandering (voor SPA's)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            initialize();
        }
    }).observe(document, {subtree: true, childList: true});

})();



