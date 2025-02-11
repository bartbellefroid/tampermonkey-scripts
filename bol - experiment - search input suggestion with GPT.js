// ==UserScript==
// @name         Bol.com - experiment: LLM search input suggestion script with GPT-4
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  This experiment shows an alternative way for the product you are searching for...
// @author       Bart Bellefroid, ChatGPT
// @match        *://*.bol.com/*/*/s/*
// @grant        GM_xmlhttpRequest
// @downloadURL  https://gitlab.bol.io/bbellefroid/nemo-webshop-plugin/-/raw/master/nemo-webshop-plugin.js
// @updateURL    https://gitlab.bol.io/bbellefroid/nemo-webshop-plugin/-/raw/master/nemo-webshop-plugin.js

// ==/UserScript==

(function() {
    'use strict';

    console.log("Experiment: LLM search input suggestion script started!");

    // Voer uit wanneer de pagina geladen is of de URL verandert
    window.onload = function() {
        var suggestie = 'helaas geen suggestie';
        var zoekterm = haalZoektermOp();
        if (zoekterm) {
            console.log("Gevonden zoekterm: " + zoekterm);
            var openAI_API_Key = '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'; //Please use your own key :-P


            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.openai.com/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + openAI_API_Key
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
                    var result = JSON.parse(response.responseText);
                    console.log("Succesvol antwoord van chat GPT: ");
                    console.log(result);
                    console.log("Toevoegen aan suggestie variabele");
                    var suggestie = result.choices[0].message.content;
                    suggestie = suggestie.replace(/^"|"$/g, '');
                    console.log(suggestie);

                     // Vind het eerste <h1>-element op de pagina
                    var h1Element = document.querySelector('h1');

                    // Creëer een nieuw <p>-element
                    var pDisplay = document.createElement('p');
                    pDisplay.innerHTML = '&#129302; AI-gebaseerde zoeksuggestie (GPT-4o-mini): <a href="https://www.bol.com/nl/nl/s/?searchtext='+ suggestie + '" target="_blank">' + suggestie + '</a>';
                    console.log(suggestie);

                    // Voeg het nieuwe <p>-element toe direct na het <h1>-element
                    if (h1Element) {
                        h1Element.insertAdjacentElement('afterend', pDisplay);
                    }
                },
                onerror: function(error) {
                    console.error('Fout bij het aanroepen van de OpenAI API:', error);
                }
            });

        }

    };

    function haalZoektermOp() {
        return new URLSearchParams(window.location.search).get('searchtext');
    }

})();



