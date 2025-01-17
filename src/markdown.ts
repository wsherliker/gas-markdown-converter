
type Preference = {
	codeblockUseTable: boolean;
	codeblockDarkMode: boolean;
};

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
	DocumentApp.getUi()
		.createAddonMenu()
		.addItem("Show Sidebar", "showSidebar")
		.addItem("Convert Selected", "convertSelectedText")
		.addItem("Convert All", "convertAllText")
		.addToUi();
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
	var ui = HtmlService.createHtmlOutputFromFile("sidebar").setTitle(
		"Markdown Converter"
	);
	DocumentApp.getUi().showSidebar(ui);
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
	onOpen(e);
}

function getPreferences(): Preference {
	const userProperties = PropertiesService.getUserProperties();
	return {
		codeblockUseTable:
			userProperties.getProperty("codeblockUseTable") === "true",
		codeblockDarkMode:
			userProperties.getProperty("codeblockDarkMode") === "true",
	};
}

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 *
 * @return {Array.<string>} The selected text.
 */
function convertSelectedText(prefs: Preference) {
	if (!prefs) { prefs = { codeblockUseTable: false, codeblockDarkMode: false }; }
	const { codeblockUseTable, codeblockDarkMode } = prefs;

	PropertiesService.getUserProperties()
		.setProperty("codeblockUseTable", codeblockUseTable ? "true" : "")
		.setProperty("codeblockDarkMode", codeblockDarkMode ? "true" : "");

	const selection = DocumentApp.getActiveDocument().getSelection();
	if (selection) {
		const elements = selection.getRangeElements();
		renderMarkdown(elements, prefs);
	}
	return [];
}

function convertAllText(prefs: Preference) {
	if (!prefs) { prefs = { codeblockUseTable: false, codeblockDarkMode: false }; }
	const { codeblockUseTable, codeblockDarkMode } = prefs;

	PropertiesService.getUserProperties()
		.setProperty("codeblockUseTable", codeblockUseTable ? "true" : "")
		.setProperty("codeblockDarkMode", codeblockDarkMode ? "true" : "");

	var window = 5000;
	var body = DocumentApp.getActiveDocument().getBody();
	var elementCount = body.getNumChildren();
	var loops = Math.ceil(elementCount / window);
	Logger.log("Starting processing...");
	for (var j = 0; j < loops; j++) {
		Logger.log("Loop " + j);
		var elements = [];
		var max = Math.min(elementCount, (j + 1) * window);
		for(var i = (j * window) + 0; i < max; i++) {
			elements.push(body.getChild(i));
		}
		renderMarkdown(elements, prefs);

		// Force Google Docs to push changes to the document rather than caching them - avoids issues with large docs and running out of memory
		var id = DocumentApp.getActiveDocument().getId();
		DocumentApp.getActiveDocument().saveAndClose();
      	DocumentApp.openById(id);
		body = DocumentApp.getActiveDocument().getBody();
	}

	return [];
}
