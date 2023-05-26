const char_limit = 100000;

function display(summary) {
    header = document.createElement("div");
    header.style.backgroundColor = "#d18ee2";
    header.style.padding = "5px";

    tldr = document.createElement("p");
    tldr.textContent = `tl;dr: ${summary}`;
    tldr.style.margin = "10px 100px";
    tldr.style.fontSize = "medium";
    tldr.style.color = "white";
    tldr.style.textAlign = "center";
    tldr.style.fontFamily = "Verdana, Geneva, sans-serif";
    header.appendChild(tldr);
    document.body.parentNode.insertBefore(header, document.body);
}

function summarize(text) {
    chrome.storage.sync.get('apiKey', key => {
        options = {
            "method": "POST",
            "headers": {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": "Bearer " + key.apiKey
            },
            "body": JSON.stringify({
                "length": "auto",
                "format": "auto",
                "model": "summarize-xlarge",
                "extractiveness": "low",
                "temperature": 0.1,
                "text": text,
                "additional_command": "of this webpage"
            })
        };

        fetch('https://api.cohere.ai/v1/summarize', options)
            .then((response) => response.json())
            .then((data) => {
                if (data.summary === undefined) {
                    display("There was an error: " + data.message);
                } else {
                    display(data.summary);
                }
            });
    });
}

function isHidden(el) {
    var style = window.getComputedStyle(el);
    return ((style.display === 'none') || (style.visibility === 'hidden'))
}

function getVisibleText() {
    var body = document.querySelector('body')
    if (document.querySelector('#content')) {
        body = document.querySelector('#content');
    }
    if (document.main) {
        body = document.querySelector('main');
    }
    var allTags = body.getElementsByTagName('*');

    let visible_text = [];
    var n_chars = 0;
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
            n_chars += text.length + 1; // for newline
            if (n_chars < char_limit) {
                visible_text.push(text);
            } else {
                break
            }
        }
    }
    return visible_text.join('\n');
}


chrome.storage.sync.get('apiKey', key => {
    console.log(key.apiKey);
    if (key.apiKey === undefined) {
        display("Please set an API key in co:ndense > Options");
    } else {
        const truncated_visible_text = getVisibleText();
        console.log(truncated_visible_text)
        const summary = summarize(truncated_visible_text)
    }
});
