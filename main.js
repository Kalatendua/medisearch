console.log("main.js script started"); // Log script start

// API Key Handling
const apiKeyDiv = document.getElementById('apiKeyDiv');
const chatDiv = document.getElementById('chatDiv');
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyButton = document.getElementById('saveApiKey');
const apiKeyError = document.getElementById('apiKeyError');

// Filter Elements
const rememberFiltersCheckbox = document.getElementById('rememberFilters');
const publicationDateSlider = document.getElementById('publicationDate');
const dateValueSpan = document.getElementById('dateValue');
const sourceCheckboxes = document.querySelectorAll('.source');
const subtypeCheckboxes = document.querySelectorAll('.subtype');
const deselectAllButton = document.getElementById('deselectAll');
const scientificCheckbox = document.querySelector('.source[value="scientific"]');
const scientificSubtypesDiv = document.getElementById('scientificSubtypes');

// Chat Elements
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatHistoryDiv = document.getElementById('chatHistory');

const MEDISEARCH_API_URL = 'https://medisearch.io/api/chat'; // Adjust per actual API docs if needed

// --- Initialization ---

function initializeApp() {
  console.log("initializeApp started"); // Log function start
  try {
    // Ensure elements exist before proceeding
    if (!apiKeyDiv || !chatDiv || !apiKeyInput || !saveApiKeyButton || !apiKeyError ||
        !rememberFiltersCheckbox || !publicationDateSlider || !dateValueSpan ||
        !sourceCheckboxes.length || !subtypeCheckboxes.length || !deselectAllButton ||
        !scientificCheckbox || !scientificSubtypesDiv || !userInput || !sendButton || !chatHistoryDiv) {
      console.error("Initialization failed: One or more required DOM elements not found.");
      // Display error to user?
      const body = document.querySelector('body');
      if (body) {
          const errorMsg = document.createElement('p');
          errorMsg.textContent = "Error initializing the application. Required elements missing. Please check the console.";
          errorMsg.style.color = 'red';
          body.prepend(errorMsg); // Prepend to make it visible even if CSS hides other things
      }
      return; // Stop initialization
    }
    console.log("DOM elements found.");

    loadApiKey();
    console.log("API key loaded.");
    loadChatHistory();
    console.log("Chat history loaded.");
    loadFilters();
    console.log("Filters loaded.");
    setupEventListeners();
    console.log("Event listeners set up.");
    updateSubtypeVisibility(); // Initial check for subtype visibility
    console.log("Subtype visibility updated.");

    console.log("initializeApp completed successfully.");

  } catch (error) {
    console.error("Error during initializeApp:", error);
    // Display a user-friendly error message in the UI as well
    const body = document.querySelector('body');
     if (body) {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Critical error during application startup: ${error.message}. Please check the console.`;
        errorMsg.style.color = 'red';
        errorMsg.style.fontWeight = 'bold';
        body.prepend(errorMsg);
    }
  }
}

// --- API Key Management ---

function loadApiKey() {
  const savedApiKey = localStorage.getItem('medisearchApiKey');
  if (savedApiKey) {
    apiKeyDiv.style.display = 'none';
    chatDiv.style.display = 'block';
  } else {
    apiKeyDiv.style.display = 'block';
    chatDiv.style.display = 'none';
  }
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (key) {
    // Basic validation - replace with actual API call if needed for verification
    localStorage.setItem('medisearchApiKey', key);
    apiKeyError.textContent = '';
    apiKeyDiv.style.display = 'none';
    chatDiv.style.display = 'block';
    // Optionally load history/filters again if needed after key save
    loadChatHistory();
    loadFilters();
  } else {
    apiKeyError.textContent = 'Please enter a valid API key.';
  }
}

// --- Filter Management ---

function updateDateValue() {
  // Add checks for element existence
  if (publicationDateSlider && dateValueSpan) {
    const value = publicationDateSlider.value;
    dateValueSpan.textContent = value === '0' ? 'Any year' : value;
  } else {
    console.error("updateDateValue: Slider or Span element not found.");
  }
}

function deselectAllSources() {
  if (sourceCheckboxes && sourceCheckboxes.length > 0) {
    sourceCheckboxes.forEach(cb => cb.checked = false);
    updateSubtypeVisibility(); // Subtypes depend on the scientific source
    saveFilters(); // Save changes
  } else {
     console.error("deselectAllSources: Source checkboxes not found.");
  }
}

function updateSubtypeVisibility() {
  // Add checks for element existence
  if (scientificCheckbox && scientificSubtypesDiv && subtypeCheckboxes) {
    const isScientificChecked = scientificCheckbox.checked;
    scientificSubtypesDiv.style.display = isScientificChecked ? 'block' : 'none';
    subtypeCheckboxes.forEach(cb => cb.disabled = !isScientificChecked);
    if (!isScientificChecked) {
      // Uncheck subtypes if scientific is deselected
      subtypeCheckboxes.forEach(cb => cb.checked = false);
    }
  } else {
     console.error("updateSubtypeVisibility: Required elements not found.");
  }
}

function saveFilters() {
  // Add checks for element existence
  if (!rememberFiltersCheckbox || !publicationDateSlider || !sourceCheckboxes || !scientificCheckbox || !subtypeCheckboxes) {
      console.error("saveFilters: One or more filter elements missing.");
      return;
  }

  if (rememberFiltersCheckbox.checked) {
    sessionStorage.setItem('rememberFilters', 'true');
    sessionStorage.setItem('publicationDate', publicationDateSlider.value);
    const sources = Array.from(sourceCheckboxes)
                         .filter(cb => cb.checked)
                         .map(cb => cb.value);
    sessionStorage.setItem('sources', JSON.stringify(sources));

    if (scientificCheckbox.checked) {
      const subtypes = Array.from(subtypeCheckboxes)
                            .filter(cb => cb.checked)
                            .map(cb => cb.value);
      sessionStorage.setItem('subtypes', JSON.stringify(subtypes));
    } else {
      sessionStorage.removeItem('subtypes'); // Remove if scientific not checked
    }

  } else {
    // Clear only filter-related keys if checkbox is unchecked
    sessionStorage.removeItem('rememberFilters');
    sessionStorage.removeItem('publicationDate');
    sessionStorage.removeItem('sources');
    sessionStorage.removeItem('subtypes');
  }
}

function loadFilters() {
   // Add checks for element existence
  if (!rememberFiltersCheckbox || !publicationDateSlider || !dateValueSpan || !sourceCheckboxes || !scientificCheckbox || !subtypeCheckboxes) {
      console.error("loadFilters: One or more filter elements missing.");
      return;
  }

  const remember = sessionStorage.getItem('rememberFilters') === 'true';
  rememberFiltersCheckbox.checked = remember;

  if (remember) {
    publicationDateSlider.value = sessionStorage.getItem('publicationDate') || '0';
    updateDateValue();

    const savedSources = JSON.parse(sessionStorage.getItem('sources') || '[]');
    sourceCheckboxes.forEach(cb => {
      cb.checked = savedSources.includes(cb.value);
    });

    updateSubtypeVisibility(); // Update visibility based on loaded scientific checkbox state

    if (scientificCheckbox.checked) {
      const savedSubtypes = JSON.parse(sessionStorage.getItem('subtypes') || '[]');
      subtypeCheckboxes.forEach(cb => {
        cb.checked = savedSubtypes.includes(cb.value);
      });
    }
  } else {
    // Set defaults if not remembering
    publicationDateSlider.value = '0';
    updateDateValue();
    // Set default checkboxes (as per initial HTML)
    sourceCheckboxes.forEach(cb => {
        cb.checked = ['scientific', 'guidelines', 'medicine', 'healthline'].includes(cb.value);
    });
    subtypeCheckboxes.forEach(cb => {
        // Only check subtypes if scientific is checked by default
        cb.checked = scientificCheckbox.checked;
    });
    updateSubtypeVisibility();
  }
}

// --- Chat Functionality ---

function appendMessage(sender, message, isError = false) {
  if (!chatHistoryDiv) {
      console.error("appendMessage: chatHistoryDiv not found.");
      return;
  }
  const messageDiv = document.createElement('div');
  messageDiv.textContent = `${sender}: ${message}`;
  if (isError) {
    messageDiv.style.color = 'red';
  }
  chatHistoryDiv.appendChild(messageDiv);
  // Scroll to the bottom
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

  // Save to history only if it's not an error message displayed to the user
  if (sender !== 'System') {
      saveToChatHistory({ sender, message });
  }
}

function saveToChatHistory(entry) {
  // Don't save empty messages or system messages
  if (!entry.message || entry.sender === 'System') return;
  try {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.push(entry);
    // Optional: Limit history size
    // const MAX_HISTORY = 100;
    // if (history.length > MAX_HISTORY) {
    //   history.splice(0, history.length - MAX_HISTORY);
    // }
    localStorage.setItem('chatHistory', JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save chat history:", error);
    // Avoid infinite loop if appendMessage itself fails
    // appendMessage('System', 'Error saving chat history.', true);
  }
}


function loadChatHistory() {
  if (!chatHistoryDiv) {
      console.error("loadChatHistory: chatHistoryDiv not found.");
      return;
  }
  chatHistoryDiv.innerHTML = ''; // Clear existing messages
  try {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.forEach(entry => {
      // Append without saving again
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${entry.sender}: ${entry.message}`;
      chatHistoryDiv.appendChild(messageDiv);
    });
    // Scroll to the bottom after loading
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
  } catch (error) {
    console.error("Failed to load chat history:", error);
    localStorage.removeItem('chatHistory'); // Clear corrupted history
    // Avoid infinite loop if appendMessage itself fails
    // appendMessage('System', 'Error loading chat history. History cleared.', true);
  }
}

async function sendMessage() {
  if (!userInput || !chatHistoryDiv) {
      console.error("sendMessage: Input or history element not found.");
      return;
  }
  const query = userInput.value.trim();
  if (!query) return;

  const apiKey = localStorage.getItem('medisearchApiKey');
  if (!apiKey) {
    appendMessage('System', 'API Key not found. Please save your API key first.', true);
    return;
  }

  // Display user message immediately
  appendMessage('You', query);
  userInput.value = ''; // Clear input field

  // Prepare API parameters
  const dateFrom = publicationDateSlider.value === '0' ? null : parseInt(publicationDateSlider.value, 10); // Ensure it's a number or null
  const sources = Array.from(sourceCheckboxes)
                       .filter(cb => cb.checked)
                       .map(cb => cb.value);
  const subtypes = scientificCheckbox.checked
                   ? Array.from(subtypeCheckboxes)
                       .filter(cb => cb.checked)
                       .map(cb => cb.value)
                   : []; // Empty array if scientific articles not selected

  const requestBody = {
    query: query,
    // Ensure parameters match the API documentation exactly
    // Using snake_case as per user's example, adjust if needed
    date_from: dateFrom,
    sources: sources, // Send as array
    scientific_subtypes: subtypes // Send as array
  };

  // Add loading indicator (optional)
  const loadingDiv = document.createElement('div');
  loadingDiv.textContent = 'AI: Thinking...';
  loadingDiv.style.fontStyle = 'italic';
  loadingDiv.id = 'loadingIndicator'; // Give it an ID for easier removal
  chatHistoryDiv.appendChild(loadingDiv);
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;


  try {
    const response = await fetch(MEDISEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`, // Common practice, adjust if API uses different auth
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Remove loading indicator
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) chatHistoryDiv.removeChild(indicator);


    if (!response.ok) {
      // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
      let errorMsg = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.detail || JSON.stringify(errorData)}`; // Try to get more detail
      } catch (e) { /* Ignore if response body is not JSON */ }
      appendMessage('AI', errorMsg, true);
      return; // Stop processing on error
    }

    const data = await response.json();

    // --- IMPORTANT: Adjust based on the ACTUAL API response structure ---
    // Assuming the response structure contains a field like 'response', 'answer', or 'message'
    // Check the Medisearch API documentation for the exact structure.
    const aiResponse = data.response || data.answer || data.message || JSON.stringify(data) || 'No valid response content found in API reply.';
    // --------------------------------------------------------------------

    appendMessage('AI', aiResponse);

  } catch (error) {
     // Remove loading indicator even if fetch fails
     const indicator = document.getElementById('loadingIndicator');
     if (indicator && chatHistoryDiv.contains(indicator)) { // Check if it still exists
        chatHistoryDiv.removeChild(indicator);
     }
    console.error("API request failed:", error);
    appendMessage('AI', `Error: Failed to fetch response. ${error.message}`, true);
  }
}

// --- Event Listeners Setup ---

function setupEventListeners() {
  // Add checks for element existence before adding listeners
  if (saveApiKeyButton) {
    saveApiKeyButton.addEventListener('click', saveApiKey);
  } else { console.error("setupEventListeners: saveApiKeyButton not found."); }

  if (apiKeyInput) {
    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveApiKey();
    });
  } else { console.error("setupEventListeners: apiKeyInput not found."); }

  if (publicationDateSlider) {
    publicationDateSlider.addEventListener('input', updateDateValue);
    publicationDateSlider.addEventListener('change', saveFilters); // Save on release
  } else { console.error("setupEventListeners: publicationDateSlider not found."); }

  if (deselectAllButton) {
    deselectAllButton.addEventListener('click', deselectAllSources);
  } else { console.error("setupEventListeners: deselectAllButton not found."); }

  if (sourceCheckboxes && sourceCheckboxes.length > 0) {
    sourceCheckboxes.forEach(cb => cb.addEventListener('change', () => {
      updateSubtypeVisibility();
      saveFilters();
    }));
  } else { console.error("setupEventListeners: sourceCheckboxes not found or empty."); }

  if (subtypeCheckboxes && subtypeCheckboxes.length > 0) {
    subtypeCheckboxes.forEach(cb => cb.addEventListener('change', saveFilters));
  } else { console.error("setupEventListeners: subtypeCheckboxes not found or empty."); }

  if (rememberFiltersCheckbox) {
    rememberFiltersCheckbox.addEventListener('change', saveFilters);
  } else { console.error("setupEventListeners: rememberFiltersCheckbox not found."); }

  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  } else { console.error("setupEventListeners: sendButton not found."); }

  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  } else { console.error("setupEventListeners: userInput not found."); }
}

// --- Run Application ---
// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded event fired."); // Log DOM ready
  initializeApp();
});

console.log("main.js script finished initial execution"); // Log script end
