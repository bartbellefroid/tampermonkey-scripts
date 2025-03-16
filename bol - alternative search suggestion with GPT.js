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

    console.log("Alternative Search Suggestion Script started!");
    
    // CSS for our UI elements
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
    
    // Get or set API key
    function getApiKey() {
        let apiKey = GM_getValue('openai_api_key');
        
        if (!apiKey) {
            apiKey = prompt('Enter your OpenAI API key (will be stored locally):');
            if (apiKey) {
                GM_setValue('openai_api_key', apiKey);
            }
        }
        
        return apiKey;
    }
    
    // Add styles to the page
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
    }
    
    // Get search term from URL
    function getSearchTerm() {
        return new URLSearchParams(window.location.search).get('searchtext');
    }
    
    // Add the suggestion container to the page
    function createSuggestionContainer() {
        const h1Element = document.querySelector('h1');
        if (!h1Element) return null;
        
        const container = document.createElement('div');
        container.className = 'ai-suggestion-container';
        
        const title = document.createElement('div');
        title.className = 'ai-suggestion-title';
        title.innerHTML = '<span class="ai-suggestion-loader"></span>🤖 AI-based search suggestion (GPT-4o-mini)';
        container.appendChild(title);
        
        const content = document.createElement('div');
        content.className = 'ai-suggestion-content';
        content.textContent = 'Loading suggestion...';
        container.appendChild(content);
        
        // Add info icon
        const infoIcon = document.createElement('div');
        infoIcon.className = 'ai-info-icon';
        infoIcon.textContent = 'i';
        container.appendChild(infoIcon);
        
        // Tooltip for info icon
        const tooltip = document.createElement('div');
        tooltip.className = 'ai-info-tooltip';
        tooltip.innerHTML = 'This is a Tampermonkey browser extension that shows AI-based search suggestions for Bol.com. ' +
                           'The suggestions are generated by the GPT-4o-mini model from OpenAI.';
        container.appendChild(tooltip);
        
        // Event listener for showing/hiding the tooltip
        infoIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            tooltip.classList.toggle('visible');
        });
        
        // Hide tooltip when clicking outside the element
        document.addEventListener('click', function() {
            tooltip.classList.remove('visible');
        });
        
        h1Element.insertAdjacentElement('afterend', container);
        return container;
    }
    
    // Update the suggestion container with new content
    function updateSuggestionContainer(container, suggestion, isError = false) {
        const titleElement = container.querySelector('.ai-suggestion-title');
        const contentElement = container.querySelector('.ai-suggestion-content');
        
        // Remove the loader
        const loader = titleElement.querySelector('.ai-suggestion-loader');
        if (loader) {
            loader.remove();
        }
        
        if (isError) {
            titleElement.innerHTML = '🤖 AI suggestion unavailable';
            container.style.borderLeftColor = '#d32f2f';
            contentElement.textContent = suggestion;
            return;
        }
        
        titleElement.innerHTML = '🤖 AI-based search suggestion (GPT-4o-mini)';
        contentElement.innerHTML = `Alternative search term: <a href="https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(suggestion)}" target="_blank" class="ai-suggestion-link">${suggestion}</a>`;
    }
    
    // Request suggestion from OpenAI API
    function getSuggestionFromOpenAI(searchTerm, container) {
        const apiKey = getApiKey();
        
        if (!apiKey) {
            updateSuggestionContainer(container, 'No API key available. Reload the page to set it again.', true);
            return;
        }
        
        // Check cache for this search term
        const cachedSuggestion = GM_getValue(`cache_${searchTerm}`);
        if (cachedSuggestion) {
            console.log("Using cached suggestion for:", searchTerm);
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
                        "content": "Give an alternative suggestion to find products for the following words, to be used on a Dutch e-commerce website: \"" + searchTerm + "\". Answer only with the search term."
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
                    console.log("Successful response from GPT:", result);
                    
                    if (result.error) {
                        throw new Error(result.error.message || 'Unknown API error');
                    }
                    
                    let suggestion = result.choices[0].message.content;
                    suggestion = suggestion.replace(/^"|"$/g, '').trim();
                    console.log("Suggestion:", suggestion);
                    
                    // Cache the suggestion
                    GM_setValue(`cache_${searchTerm}`, suggestion);
                    
                    updateSuggestionContainer(container, suggestion);
                } catch (error) {
                    console.error('Error processing API response:', error);
                    updateSuggestionContainer(container, 'An error occurred while getting a suggestion: ' + error.message, true);
                }
            },
            onerror: function(error) {
                console.error('Error calling the OpenAI API:', error);
                updateSuggestionContainer(container, 'An error occurred while calling the API', true);
            },
            ontimeout: function() {
                console.error('Timeout calling the API');
                updateSuggestionContainer(container, 'Timeout when calling the API', true);
            }
        });
    }
    
    // Main function that initializes everything
    function initialize() {
        const searchTerm = getSearchTerm();
        if (!searchTerm) {
            console.log("No search term found in URL");
            return;
        }
        
        console.log("Found search term:", searchTerm);
        addStyles();
        
        const suggestionContainer = createSuggestionContainer();
        if (suggestionContainer) {
            getSuggestionFromOpenAI(searchTerm, suggestionContainer);
        }
    }
    
    // Start the script when the page is loaded
    window.addEventListener('load', initialize);
    
    // Also start on URL changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            initialize();
        }
    }).observe(document, {subtree: true, childList: true});

})();



