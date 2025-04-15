# Feature: Browser Extensions Core (Chrome & Firefox)

**Version:** 1.0
**Status:** Planned
**Date:** {{ CURRENT_DATE }}

**Related Features:**
- [Sanctum API Token Management](feature-sanctum-api-tokens.md)
- [Recipe Import API Endpoint](feature-recipe-import-api.md)

## 1. Overview

This specification details the creation of browser extensions for Google Chrome and Mozilla Firefox. These extensions will allow users to easily send the URL of the current webpage they are viewing to their NutriPlan application's recipe import API endpoint.

## 2. Goals

-   Develop functional browser extensions for both Chrome (Manifest V3) and Firefox.
-   Provide a simple toolbar icon (action button) to trigger the import.
-   Include an options page for users to configure their API token and the application's base URL.
-   Securely store user settings using browser storage.
-   Communicate with the backend Recipe Import API endpoint.
-   Provide basic user feedback (success/error notifications).

## 3. Requirements

### 3.1. Core Structure & Manifest

-   **Project Structure:** Set up a basic structure suitable for building both extensions, potentially sharing common code where possible (e.g., core logic, CSS).
-   **Manifest File (`manifest.json`):**
    -   Create separate `manifest.json` files tailored for Chrome (V3) and Firefox (V2/V3 as needed, prefer V3 where possible).
    -   **Common Fields:** `manifest_version`, `name`, `version`, `description`, `icons`.
    -   **Permissions:**
        -   `storage`: To store API token and App URL.
        -   `activeTab`: To get the current tab's URL (required for the core action).
        -   `notifications`: To show feedback to the user directly from the extension.
        -   `scripting`: (Manifest V3) Needed if interacting with the page DOM, though `activeTab` might suffice for just getting the URL. Replaces `tabs` permission for some operations.
        -   `tabs`: (Manifest V2) May be needed for getting tab URL in older Firefox versions if `activeTab` isn't sufficient or for opening the options page programmatically.
        -   `host_permissions` (Manifest V3) / `permissions` containing `<all_urls>` or specific domains (Manifest V2/V3): Required to make fetch requests to the user-configured App URL. `<all_urls>` is simplest for a user-defined URL, but more specific patterns could be used if the App URL structure is predictable or limited.
    -   **Action:**
        -   `action` (Chrome V3) / `browser_action` (Firefox/Chrome V2): Define the toolbar icon and potentially a default popup (though for this simple case, triggering the background script directly on click is sufficient).
    -   **Options UI:**
        -   `options_page` (Manifest V2) / `options_ui` (Manifest V3): Specify the HTML file for the extension's settings page (e.g., `options.html`). Ensure `open_in_tab` is true for a standard page experience.
    -   **Background Logic:**
        -   `background.service_worker` (Chrome V3): Path to the service worker script (e.g., `background.js`).
        -   `background.scripts` (Firefox/Chrome V2): Array containing path(s) to background script(s) (e.g., `["background.js"]`). Set `persistent` to `false` if possible for event-driven background scripts in V2.

### 3.2. Options Page (`options.html`, `options.js`)

-   **HTML (`options.html`):**
    -   Create a simple HTML structure with:
        -   Input field for the API Token (type="password" recommended).
        -   Input field for the NutriPlan Application Base URL (type="url" recommended).
        -   A "Save" button.
        -   An area to display status messages (e.g., "Settings saved", "Error saving").
-   **JavaScript (`options.js`):**
    -   On page load, retrieve existing settings (API Token, App URL) from `browser.storage.sync` (preferred for syncing across devices) or `browser.storage.local`. Populate the input fields.
    -   Add an event listener to the "Save" button.
    -   On save:
        -   Read the values from the input fields.
        -   Perform basic validation (e.g., check if fields are not empty, URL looks like a URL).
        -   Save the validated values to `browser.storage.sync` or `browser.storage.local`.
        -   Display a success or error message to the user.

### 3.3. Background Script (`background.js` / Service Worker)

-   **Event Listener:**
    -   Add a listener for the `browser.action.onClicked` event.
-   **Action Logic (inside the listener):**
    1.  **Retrieve Settings:** Fetch the stored API Token and App URL from `browser.storage`.
    2.  **Check Settings:** Verify that both settings exist. If not:
        -   Option 1: Use `browser.notifications.create` to show an error message instructing the user to configure the extension via the options page.
        -   Option 2: Programmatically open the options page using `browser.runtime.openOptionsPage()`.
        -   Abort further execution.
    3.  **Get Current Tab URL:** Use `browser.tabs.query({ active: true, currentWindow: true })` to get the active tab's information. Extract the `url` from the result. Handle potential errors (e.g., no active tab found).
    4.  **Construct API URL:** Combine the stored App URL with the specific API endpoint path (`/api/v1/recipes/import-via-extension`).
    5.  **Make API Request:**
        -   Use the `fetch` API to make a POST request.
        -   **Headers:**
            -   `Content-Type: application/json`
            -   `Accept: application/json`
            -   `Authorization: Bearer YOUR_API_TOKEN` (use the token retrieved from storage).
        -   **Body:** JSON stringify an object containing the current tab's URL: `JSON.stringify({ url: currentTabUrl })`.
    6.  **Handle Response:**
        -   Check the HTTP status code (`response.status`).
        -   **Success (e.g., 202 Accepted):** Use `browser.notifications.create` to show a success message (e.g., "Recipe import started!").
        -   **Authentication Error (e.g., 401 Unauthorized):** Show a notification indicating an invalid API token and suggest checking the options page.
        -   **Validation Error (e.g., 422 Unprocessable Entity):** Show a notification indicating an invalid URL was sent (less likely if the tab URL is valid, but possible).
        -   **Server Error (e.g., 5xx):** Show a generic error notification indicating a server problem.
        -   **Network Error (catch block for `fetch`):** Show a notification indicating a network issue preventing connection to the App URL.

## 4. Technical Design Notes

-   **Cross-Browser Compatibility:** Prioritize using the `browser.*` namespace (WebExtension API) for better compatibility. Polyfills might be needed for older browser versions if targeted.
-   **Manifest V3 vs V2:** Be mindful of the differences, especially regarding background scripts (service workers vs. persistent/event pages) and permissions (`host_permissions` vs. `permissions` containing URLs). Target V3 for Chrome.
-   **Error Handling:** Provide clear, actionable feedback to the user via notifications for common issues (missing settings, auth errors, network errors).
-   **API Token Security:** Store the token using `browser.storage`. While not perfectly secure (accessible via browser dev tools), `storage.sync` is standard practice. Avoid storing it in plaintext in the code itself.

## 5. Implementation Plan

1.  Set up the basic extension project structure(s).
2.  Create the `manifest.json` files for Chrome (V3) and Firefox.
3.  Develop the `options.html` page structure.
4.  Implement the `options.js` logic for loading and saving settings to `browser.storage`.
5.  Implement the `background.js` (or service worker):
    -   Add the `onClicked` listener.
    -   Implement logic to retrieve settings and the active tab's URL.
    -   Implement the `fetch` call to the backend API endpoint, including headers and body.
    -   Add notification logic for success and various error conditions.
6.  Test the extension manually in both Chrome and Firefox:
    -   Test saving/loading settings on the options page.
    -   Test clicking the action button with no settings configured.
    -   Test clicking the action button with valid settings on a recipe page.
    -   Verify API call is made correctly (check browser network tools and backend logs/job queue).
    -   Verify success notification appears.
    -   Test with an invalid API token (expect 401 error notification).
    -   Test with an incorrect App URL (expect network error notification).

## 6. Future Considerations

-   Adding a popup to the action button for more immediate feedback or options before sending.
-   Implementing content scripts to analyze the page and potentially extract recipe data directly, sending more structured data to the API.
-   Visual feedback on the action icon (e.g., changing color during processing or on success/error).
-   More robust validation of the App URL in the options page. 