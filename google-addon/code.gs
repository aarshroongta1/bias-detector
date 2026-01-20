/**
 * Bias Detector for Google Docs
 * Analyzes document text for implicit bias
 */

// CONFIGURATION
// TODO: Replace with your deployed API URL
const API_URL = 'https://bias-detector-2ih2.onrender.com/analyze';
const MAX_TEXT_LENGTH = 10000; // Adjust based on your API limits

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  // Clear any existing highlights when opening the add-on
  clearHighlightsInDoc();
  return createBiasDetectorCard();
}

/**
 * Creates the main card for the add-on.
 */
function createBiasDetectorCard() {
  var card = CardService.newCardBuilder();
  var section = CardService.newCardSection();
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#1f2937"><b>Bias Detector</b></font>')
  );
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#6b7280">Analyzes text for implicit bias including gendered language, assumptions, and stereotypes.</font>')
  );
  
  section.addWidget(
    CardService.newTextButton()
      .setText('Check Entire Document')
      .setOnClickAction(
        CardService.newAction().setFunctionName('analyzeFullDocument')
      )
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
  );
  
  section.addWidget(
    CardService.newTextButton()
      .setText('Check Selection')
      .setOnClickAction(
        CardService.newAction().setFunctionName('analyzeSelection')
      )
  );
  
  card.addSection(section);
  return card.build();
}

/**
 * Analyzes the entire document for bias.
 */
function analyzeFullDocument(e) {
  try {
    // Clear any existing highlights before new analysis
    clearHighlightsInDoc();
    
    var text = getDocumentText();
    
    if (!text || text.trim().length === 0) {
      return createErrorCard('No text found in the document.');
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
      return createErrorCard('Document is too long (' + text.length + ' characters). Maximum is ' + MAX_TEXT_LENGTH + ' characters. Try analyzing a selection instead.');
    }
    
    var issues = callBiasAPI(text);
    
    // Highlight issues in the document
    if (issues.length > 0) {
      highlightIssuesInDoc(issues);
    }
    
    return createResultCard(issues, 'Full Document');
    
  } catch (error) {
    Logger.log('Error in analyzeFullDocument: ' + error);
    return createErrorCard(error.message || 'An unexpected error occurred.');
  }
}

/**
 * Analyzes the selected text for bias.
 */
function analyzeSelection(e) {
  try {
    // Clear any existing highlights before new analysis
    clearHighlightsInDoc();
    
    var text = getSelectedText();
    
    if (!text || text.trim().length === 0) {
      return createErrorCard('No text selected. Please select some text and try again.');
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
      return createErrorCard('Selection is too long (' + text.length + ' characters). Maximum is ' + MAX_TEXT_LENGTH + ' characters.');
    }
    
    var issues = callBiasAPI(text);
    
    // Highlight issues in the document
    if (issues.length > 0) {
      highlightIssuesInDoc(issues);
    }
    
    return createResultCard(issues, 'Selection');
    
  } catch (error) {
    Logger.log('Error in analyzeSelection: ' + error);
    return createErrorCard(error.message || 'An unexpected error occurred.');
  }
}

/**
 * Gets text from the active document.
 * @return {string} The document text
 */
function getDocumentText() {
  try {
    var doc = DocumentApp.getActiveDocument();
    if (!doc) {
      throw new Error('No active document found.');
    }
    return doc.getBody().getText();
  } catch (e) {
    Logger.log('Error getting document text: ' + e);
    throw new Error('Could not access document text.');
  }
}

/**
 * Gets the selected text from the active document.
 * @return {string} The selected text
 */
function getSelectedText() {
  try {
    var doc = DocumentApp.getActiveDocument();
    if (!doc) {
      throw new Error('No active document found.');
    }
    
    var selection = doc.getSelection();
    if (!selection) {
      return '';
    }
    
    var elements = selection.getRangeElements();
    var text = '';
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      
      if (element.getElement().editAsText) {
        var elementText = element.getElement().asText().getText();
        
        if (element.isPartial()) {
          elementText = elementText.substring(
            element.getStartOffset(),
            element.getEndOffsetInclusive() + 1
          );
        }
        
        text += elementText;
      }
    }
    
    return text;
  } catch (e) {
    Logger.log('Error getting selected text: ' + e);
    throw new Error('Could not access selected text.');
  }
}

/**
 * Calls the bias detection API.
 * @param {string} text The text to analyze
 * @return {Array} Array of bias issues
 */
function callBiasAPI(text) {
  // Check if API URL is configured
  if (API_URL === 'https://your-api-url.com/analyze') {
    throw new Error('API URL not configured. Please update API_URL in the script.');
  }
  
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify({ text: text }),
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(API_URL, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log('API returned status: ' + responseCode);
      Logger.log('Response: ' + response.getContentText());
      throw new Error('API request failed (status ' + responseCode + '). Please try again.');
    }
    
    var json = JSON.parse(response.getContentText());
    return json.results?.biases || [];
    
  } catch (e) {
    Logger.log('API Error: ' + e);
    
    // Provide more specific error messages
    if (e.message.includes('Address unavailable')) {
      throw new Error('Could not connect to the bias detection service. Please check your internet connection.');
    } else if (e.message.includes('Timeout')) {
      throw new Error('The request timed out. Please try with a shorter text.');
    } else if (e.message.includes('API request failed')) {
      throw e; // Re-throw our custom error
    } else {
      throw new Error('Failed to analyze text. Please try again later.');
    }
  }
}

/**
 * Creates a card showing the analysis results.
 * @param {Array} issues Array of bias issues
 * @param {string} source Source of the analyzed text (e.g., "Full Document" or "Selection")
 * @return {CardService.Card} The result card
 */
function createResultCard(issues, source) {
  var card = CardService.newCardBuilder();
  var headerSection = CardService.newCardSection();
  
  // Header
  headerSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#1f2937"><b>Analysis Complete</b></font><br><font color="#6b7280">' + source + '</font>')
  );
  
  if (issues.length === 0) {
    headerSection.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#059669"><b>No bias detected</b></font><br><font color="#6b7280">Your text uses inclusive language.</font>')
    );
    
    headerSection.addWidget(
      CardService.newTextButton()
        .setText('Check Again')
        .setOnClickAction(
          CardService.newAction().setFunctionName('onHomepage')
        )
    );
    
    card.addSection(headerSection);
    return card.build();
  }
  
  // Flatten issues to show one card per instance
  var allInstances = [];
  issues.forEach(function(issue) {
    if (issue.positions && issue.positions.length > 0) {
      issue.positions.forEach(function(pos) {
        allInstances.push({
          phrase: issue.phrase,
          category: issue.category,
          explanation: issue.explanation,
          replacement: issue.replacement,
          severity: issue.severity,
          position: pos
        });
      });
    } else {
      allInstances.push(issue);
    }
  });
  
  headerSection.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#dc2626"><b>' + allInstances.length + ' issue' + (allInstances.length === 1 ? '' : 's') + ' found</b></font>')
  );
  
  card.addSection(headerSection);
  
  // Severity color mapping
  var severityColors = {
    'low': '#059669',
    'medium': '#d97706', 
    'high': '#dc2626'
  };
  
  var severityLabels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };
  
  // Create a section for each instance
  allInstances.forEach(function(instance, index) {
    var issueSection = CardService.newCardSection();
    
    // Issue number and severity badge
    var severityColor = severityColors[instance.severity];
    var severityLabel = severityLabels[instance.severity];
    
    issueSection.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#6b7280">Issue ' + (index + 1) + '</font> • <font color="' + severityColor + '"><b>' + severityLabel + '</b></font>')
    );
    
    // Original phrase
    issueSection.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#6b7280">Original:</font><br><font color="#1f2937">"' + instance.phrase + '"</font>')
    );
    
    // Replacement - prominently displayed
    issueSection.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#6b7280">Suggested:</font><br><font color="#059669"><b>"' + instance.replacement + '"</b></font>')
    );
    
    // Category and explanation
    issueSection.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="#6b7280"><i>' + instance.category + '</i></font><br><font color="#374151">' + instance.explanation + '</font>')
    );
    
    // Action buttons in a compact layout
    var findAction = CardService.newAction()
      .setFunctionName('findInDocument')
      .setParameters({
        phrase: instance.phrase,
        start: instance.position ? String(instance.position.start) : '0'
      });
    
    var replaceAction = CardService.newAction()
      .setFunctionName('replacePhrase')
      .setParameters({
        phrase: instance.phrase,
        replacement: instance.replacement,
        start: instance.position ? String(instance.position.start) : '0'
      });
    
    issueSection.addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText('Find')
            .setOnClickAction(findAction)
        )
        .addButton(
          CardService.newTextButton()
            .setText('Replace')
            .setOnClickAction(replaceAction)
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        )
    );
    
    card.addSection(issueSection);
  });
  
  // Footer actions
  var footerSection = CardService.newCardSection();
  footerSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Clear Highlights')
          .setOnClickAction(
            CardService.newAction().setFunctionName('clearHighlights')
          )
      )
      .addButton(
        CardService.newTextButton()
          .setText('Check Again')
          .setOnClickAction(
            CardService.newAction().setFunctionName('onHomepage')
          )
      )
  );
  
  card.addSection(footerSection);
  return card.build();
}

/**
 * Creates an error card.
 * @param {string} message The error message to display
 * @return {CardService.Card} The error card
 */
function createErrorCard(message) {
  var card = CardService.newCardBuilder();
  var section = CardService.newCardSection();
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#dc2626"><b>Error</b></font>')
  );
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<font color="#374151">' + message + '</font>')
  );
  
  section.addWidget(
    CardService.newTextButton()
      .setText('Go Back')
      .setOnClickAction(
        CardService.newAction().setFunctionName('onHomepage')
      )
  );
  
  card.addSection(section);
  return card.build();
}

/**
 * Highlights biased phrases in the document with severity-based colors.
 * @param {Array} issues Array of bias issues
 */
function highlightIssuesInDoc(issues) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  
  // Color mapping by severity
  var severityColors = {
    'low': '#D1FAE5',      // Light green
    'medium': '#FEF3C7',   // Light yellow
    'high': '#FEE2E2'      // Light red
  };
  
  issues.forEach(function(issue) {
    var searchText = issue.phrase;
    var color = severityColors[issue.severity] || '#FEF3C7';
    
    // Find and highlight all occurrences
    var found = body.findText(searchText);
    while (found) {
      var textElement = found.getElement().asText();
      var start = found.getStartOffset();
      var end = found.getEndOffsetInclusive();
      
      textElement.setBackgroundColor(start, end, color);
      
      found = body.findText(searchText, found);
    }
  });
}

/**
 * Removes all highlighting from the document.
 */
function clearHighlightsInDoc() {
  try {
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    
    // Reset background color for entire document
    body.setBackgroundColor(null);
  } catch (error) {
    Logger.log('Error clearing highlights: ' + error);
  }
}

/**
 * Removes all highlighting and returns to homepage.
 */
function clearHighlights() {
  clearHighlightsInDoc();
  return createBiasDetectorCard();
}

/**
 * Selects and scrolls to a specific phrase in the document.
 * @param {Object} e Event object containing the phrase and start position parameters
 */
function findInDocument(e) {
  var phrase = e.parameters.phrase;
  var startPos = parseInt(e.parameters.start || '0');
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var text = body.getText();
  
  // Find the exact instance at the given position
  var found = null;
  var searchFrom = body.findText(phrase);
  
  while (searchFrom) {
    var foundStart = text.substring(0, searchFrom.getStartOffset()).length;
    
    // Check if this is the instance we're looking for
    if (Math.abs(foundStart - startPos) < 5) { // Allow small tolerance
      found = searchFrom;
      break;
    }
    
    searchFrom = body.findText(phrase, searchFrom);
  }
  
  // Fallback: just find the first occurrence if position match fails
  if (!found) {
    found = body.findText(phrase);
  }
  
  if (found) {
    var range = doc.newRange();
    range.addElement(found.getElement(), found.getStartOffset(), found.getEndOffsetInclusive());
    doc.setSelection(range.build());
  }
  
  // Return the current card to keep sidebar open
  return CardService.newActionResponseBuilder()
    .setStateChanged(false)
    .build();
}

/**
 * Replaces a specific biased phrase with the suggested replacement.
 * @param {Object} e Event object containing phrase, replacement, and start position parameters
 */
function replacePhrase(e) {
  var phrase = e.parameters.phrase;
  var replacement = e.parameters.replacement;
  var startPos = parseInt(e.parameters.start || '0');
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var text = body.getText();
  
  // Find the exact instance at the given position
  var found = null;
  var searchFrom = body.findText(phrase);
  
  while (searchFrom) {
    var foundStart = text.substring(0, searchFrom.getStartOffset()).length;
    
    // Check if this is the instance we're looking for
    if (Math.abs(foundStart - startPos) < 5) { // Allow small tolerance
      found = searchFrom;
      break;
    }
    
    searchFrom = body.findText(phrase, searchFrom);
  }
  
  // Fallback: just replace the first occurrence if position match fails
  if (!found) {
    found = body.findText(phrase);
  }
  
  if (found) {
    var element = found.getElement().asText();
    var start = found.getStartOffset();
    var end = found.getEndOffsetInclusive();
    
    // Replace just this instance
    element.deleteText(start, end);
    element.insertText(start, replacement);
  }
  
  // Return notification
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Replaced "' + phrase + '" with "' + replacement + '"'))
    .setStateChanged(true)
    .build();
}