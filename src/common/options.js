// Get the browser API namespace
const browserAPI = chrome.runtime?.getURL ? chrome : browser;

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);

// Load saved options from browser storage
function loadOptions() {
    browserAPI.storage.sync.get(['apiToken', 'appUrl'], function (items) {
        if (items.apiToken) {
            document.getElementById('apiToken').value = items.apiToken;
        }

        if (items.appUrl) {
            document.getElementById('appUrl').value = items.appUrl;
        }
    });
}

// Save options to browser storage
function saveOptions() {
    const apiToken = document.getElementById('apiToken').value.trim();
    const appUrl = document.getElementById('appUrl').value.trim();
    const statusMessage = document.getElementById('status-message');

    // Basic validation
    if (!apiToken) {
        showStatusMessage('Please enter your API token.', 'error');
        return;
    }

    if (!appUrl) {
        showStatusMessage('Please enter your NutriPlan application URL.', 'error');
        return;
    }

    // Simple URL validation
    try {
        new URL(appUrl);
    } catch (e) {
        showStatusMessage('Please enter a valid URL including http:// or https://.', 'error');
        return;
    }

    // Save the values
    browserAPI.storage.sync.set({
        apiToken: apiToken,
        appUrl: appUrl
    }, function () {
        // Show success message
        showStatusMessage('Settings saved successfully!', 'success');
    });
}

// Helper function to display status messages
function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = 'block';

    // Auto-hide the message after 3 seconds
    setTimeout(function () {
        statusMessage.style.display = 'none';
    }, 3000);
} 