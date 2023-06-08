// Copyright (c) 2023 Cohere Inc. and its affiliates.
//
// Licensed under the MIT License (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License in the LICENSE file at the top
// level of this repository.


// Summarize endpoint is currently limited to 100k chars
const charLimit = 100000;

// Display the text at the top of the page
function display(text) {
    // Create a purple header
    header = document.createElement("div");
    header.style.backgroundColor = "#d18ee2";
    header.style.padding = "5px";

    // Write the text with a bit of styling and add it to the header
    tldr = document.createElement("p");
    tldr.textContent = text;
    tldr.style.margin = "10px 100px";
    tldr.style.fontSize = "medium";
    tldr.style.color = "white";
    tldr.style.textAlign = "center";
    tldr.style.fontFamily = "Verdana, Geneva, sans-serif";
    header.appendChild(tldr);

    // Insert the header immediately before the HTML body
    document.body.parentNode.insertBefore(header, document.body);
}

// Fetch the summary for the given text and display it
function summarize(text) {
    // Use the user's stored API key
    chrome.storage.sync.get('apiKey', key => {
        // Set up the request to send to the endpoint
        options = {
            "method": "POST",
            "headers": {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": "Bearer " + key.apiKey
            },
            // These are the summarize endpt paramters.
            // Try playing around with them and reloading the extension to see
            // how they affect the summarization behaviour.
            // Reference: https://docs.cohere.com/reference/summarize-2
            "body": JSON.stringify({
                "length": "large",
                "format": "auto",
                "model": "summarize-xlarge",
                "extractiveness": "low",
                "temperature": 0.1,
                "text": text,
                // We tell the model that it's summarizing a webpage
                "additional_command": "of this webpage"
            })
        };

        fetch('https://api.cohere.ai/v1/summarize', options)
            .then((response) => response.json())
            .then((response) => {
                if (response.summary === undefined) {
                    // If there's no summary in the endpoint's response,
                    // display whatever error message it returned
                    display("There was an error: " + response.message);
                } else {
                    // Otherwise, display the summary
                    display("tl;dr: " + response.summary);
                }
            });
    });
}

// Returns true if the given element isn't visible on the page
function isHidden(el) {
    var style = window.getComputedStyle(el);
    return ((style.display === 'none') || (style.visibility === 'hidden'))
}

// Returns only the visible text from the page
function getVisibleText() {
    // Using jQuery selectors, try to find the page's main body of content,
    // often in a content or main element. Fall back to using the whole
    // body which is ~universal.
    var body = document.querySelector('body')
    if (document.querySelector('#content')) {
        body = document.querySelector('#content');
    }
    if (document.main) {
        body = document.querySelector('main');
    }
    var allTags = body.getElementsByTagName('*');

    let visibleText = [];
    var nChars = 0;
    // Select all visible text in the body, up to charLimit
    for (var i = 0, max = allTags.length; i < max; i++) {
        var elem = allTags[i];
        if (!isHidden(elem)) {

            var text = $(elem).contents().filter(function() {
                return this.nodeType == Node.TEXT_NODE;
            });
            if (text === undefined || text.length == 0) {
                continue;
            }
            text = text[0].nodeValue
            nChars += text.length + 1; // for newline
            if (nChars < charLimit) {
                visibleText.push(text);
            } else {
                break
            }
        }
    }
    // Separate all the text elements with a newline
    return visibleText.join('\n');
}

// This code block runs when pages are loaded.
chrome.storage.sync.get('apiKey', key => {
    if (key.apiKey === undefined) {
        // If there's no saved API key, tell the user how to add one
        display("Please set an API key in Condense > Options. You can get one from https://dashboard.cohere.ai/api-keys");
    } else {
        // If there is a key, we can use it to summarize the page
        const truncatedVisibleText = getVisibleText();
        // During the dev process, it's helpful to be able to see exactly what
        // text is being summarized
        console.log(truncatedVisibleText);

        summarize(truncatedVisibleText);
    }
});