// Saves options to chrome.storage
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