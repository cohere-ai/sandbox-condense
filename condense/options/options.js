// Copyright (c) 2023 Cohere Inc. and its affiliates.
//
// Licensed under the MIT License (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License in the LICENSE file at the top
// level of this repository.


// Saves the API key to chrome.storage
document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const apiKey = document.querySelector('#apiKey').value;
    chrome.storage.sync.set({
        "apiKey": apiKey
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
});