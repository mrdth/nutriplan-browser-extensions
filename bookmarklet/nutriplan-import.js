javascript: (function () {
    // Configuration modal HTML
    const configModalHTML = `
    <div id="nutriplan-config-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999999; display: flex; justify-content: center; align-items: center;">
      <div style="background: white; padding: 20px; border-radius: 5px; width: 400px; max-width: 90%;">
        <h2 style="color: #3c803c; margin-top: 0;">NutriPlan Settings</h2>
        <p style="margin-bottom: 15px;">Please enter your NutriPlan API token and application URL:</p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">API Token:</label>
          <input type="password" id="nutriplan-api-token" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" placeholder="Enter your API token">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Application URL:</label>
          <input type="url" id="nutriplan-app-url" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" placeholder="e.g., https://nutriplan.example.com">
        </div>
        <div style="display: flex; justify-content: space-between;">
          <button id="nutriplan-save-config" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">Save Settings</button>
          <button id="nutriplan-cancel-config" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
        <div id="nutriplan-status" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
      </div>
    </div>
  `;

    // Notification modal HTML
    const notificationModalHTML = `
    <div id="nutriplan-notification-modal" style="position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 999999; max-width: 300px; display: none;">
      <div id="nutriplan-notification-content"></div>
    </div>
  `;

    // Get settings from localStorage
    const getSettings = () => {
        const apiToken = localStorage.getItem('nutriplan-api-token');
        const appUrl = localStorage.getItem('nutriplan-app-url');
        return { apiToken, appUrl };
    };

    // Save settings to localStorage
    const saveSettings = (apiToken, appUrl) => {
        localStorage.setItem('nutriplan-api-token', apiToken);
        localStorage.setItem('nutriplan-app-url', appUrl);
    };

    // Show notification
    const showNotification = (message, isError = false) => {
        const notificationModal = document.getElementById('nutriplan-notification-modal');
        const notificationContent = document.getElementById('nutriplan-notification-content');

        if (!notificationModal) {
            document.body.insertAdjacentHTML('beforeend', notificationModalHTML);
            notificationModal = document.getElementById('nutriplan-notification-modal');
            notificationContent = document.getElementById('nutriplan-notification-content');
        }

        notificationContent.textContent = message;
        notificationModal.style.backgroundColor = isError ? '#f2dede' : '#dff0d8';
        notificationContent.style.color = isError ? '#a94442' : '#3c763d';
        notificationModal.style.display = 'block';

        setTimeout(() => {
            notificationModal.style.display = 'none';
        }, 3000);
    };

    // Show the configuration modal
    const showConfigModal = () => {
        // First, remove any existing modal to prevent duplicates
        const existingModal = document.getElementById('nutriplan-config-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', configModalHTML);

        // Get stored settings and populate the form
        const { apiToken, appUrl } = getSettings();
        if (apiToken) document.getElementById('nutriplan-api-token').value = apiToken;
        if (appUrl) document.getElementById('nutriplan-app-url').value = appUrl;

        // Add event listeners
        document.getElementById('nutriplan-save-config').addEventListener('click', () => {
            const newApiToken = document.getElementById('nutriplan-api-token').value.trim();
            const newAppUrl = document.getElementById('nutriplan-app-url').value.trim();

            // Basic validation
            if (!newApiToken) {
                const statusEl = document.getElementById('nutriplan-status');
                statusEl.textContent = 'Please enter your API token.';
                statusEl.style.backgroundColor = '#f2dede';
                statusEl.style.color = '#a94442';
                statusEl.style.display = 'block';
                return;
            }

            if (!newAppUrl) {
                const statusEl = document.getElementById('nutriplan-status');
                statusEl.textContent = 'Please enter your NutriPlan application URL.';
                statusEl.style.backgroundColor = '#f2dede';
                statusEl.style.color = '#a94442';
                statusEl.style.display = 'block';
                return;
            }

            // Simple URL validation
            try {
                new URL(newAppUrl);
            } catch (e) {
                const statusEl = document.getElementById('nutriplan-status');
                statusEl.textContent = 'Please enter a valid URL including http:// or https://.';
                statusEl.style.backgroundColor = '#f2dede';
                statusEl.style.color = '#a94442';
                statusEl.style.display = 'block';
                return;
            }

            // Save settings
            saveSettings(newApiToken, newAppUrl);

            // Close modal
            document.getElementById('nutriplan-config-modal').remove();

            // Show success notification
            showNotification('Settings saved successfully!');
        });

        document.getElementById('nutriplan-cancel-config').addEventListener('click', () => {
            document.getElementById('nutriplan-config-modal').remove();
        });
    };

    // Send URL to NutriPlan API
    const sendUrlToApi = (pageUrl, apiToken, appUrl) => {
        // Construct the API endpoint
        const apiEndpoint = `${appUrl.replace(/\/$/, '')}/api/recipes/import-via-extension`;

        // Show loading notification
        showNotification('Sending recipe to NutriPlan...');

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
                    showNotification('Recipe import started! Check your NutriPlan app shortly.');
                    return;
                }

                if (response.status === 401) {
                    showNotification('Authentication Error: Invalid API token. Please check your settings.', true);
                    return;
                }

                if (response.status === 422) {
                    showNotification('Validation Error: The URL provided could not be processed.', true);
                    return;
                }

                // Handle general server errors
                if (response.status >= 500) {
                    showNotification('Server Error: There was an error processing your request.', true);
                    return;
                }

                showNotification(`Error: Unexpected error (${response.status}).`, true);
            })
            .catch(error => {
                showNotification('Connection Error: Could not connect to NutriPlan.', true);
                console.error('Error sending URL to API:', error);
            });
    };

    // Main function - Check settings and send URL if they exist
    const main = () => {
        const { apiToken, appUrl } = getSettings();

        if (!apiToken || !appUrl) {
            // Settings are missing, show config modal
            showConfigModal();
            return;
        }

        // Settings exist, send the current URL to the API
        const currentUrl = window.location.href;
        sendUrlToApi(currentUrl, apiToken, appUrl);
    };

    // Run main function
    main();
})(); 