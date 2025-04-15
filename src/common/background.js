// Get the browser API namespace
const browserAPI = chrome.runtime?.getURL ? chrome : browser;

// Handle extension button click - Properly detect which API to use
if (browserAPI === chrome) {
    // Chrome implementation (works with Manifest V3)
    chrome.action?.onClicked.addListener(handleActionClick);
} else {
    // Firefox implementation (Manifest V2)
    browser.browserAction.onClicked.addListener(handleActionClick);
}

function handleActionClick(tab) {
    // Get the URL of the current tab
    const currentTabUrl = tab.url;

    // Check for settings before proceeding
    browserAPI.storage.sync.get(['apiToken', 'appUrl'], function (items) {
        if (!items.apiToken || !items.appUrl) {
            // Settings are missing, show notification and open options page
            showNotification(
                'Configuration Required',
                'Please set your API token and Application URL in the extension settings.'
            );
            browserAPI.runtime.openOptionsPage();
            return;
        }

        // Proceed with sending the URL to the API
        sendUrlToApi(currentTabUrl, items.apiToken, items.appUrl);
    });
}

function sendUrlToApi(pageUrl, apiToken, appUrl) {
    // Construct the API endpoint
    const apiEndpoint = `${appUrl.replace(/\/$/, '')}/api/recipes/import-via-extension`;

    // Make the API request
    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ url: pageUrl })
    })
        .then(response => {
            if (response.ok) {
                showNotification(
                    'Success',
                    'Recipe import started! Check your NutriPlan app shortly.'
                );
                return;
            }

            if (response.status === 401) {
                showNotification(
                    'Authentication Error',
                    'Invalid API token. Please check your settings.'
                );
                return;
            }

            if (response.status === 422) {
                showNotification(
                    'Validation Error',
                    'The URL provided could not be processed. Please try a different page.'
                );
                return;
            }

            // Handle general server errors
            if (response.status >= 500) {
                showNotification(
                    'Server Error',
                    'There was an error processing your request. Please try again later.'
                );
                return;
            }

            showNotification(
                'Error',
                `Unexpected error (${response.status}). Please try again.`
            );
        })
        .catch(error => {
            showNotification(
                'Connection Error',
                'Could not connect to your NutriPlan app. Please check your application URL and network connection.'
            );
            console.error('Error sending URL to API:', error);
        });
}

function showNotification(title, message) {
    browserAPI.notifications.create({
        type: 'basic',
        iconUrl: browserAPI.runtime.getURL('icons/icon-48.png'),
        title: title,
        message: message
    });
} 