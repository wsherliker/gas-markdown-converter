/**
 * OnlyCurrentDoc
 */

function onOpen(e) {
  DocumentApp.getUi().createMenu('Markdown Converter')
    .addItem('Convert', 'convertMarkdown')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function convertMarkdown() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (selection) {
    const elements = selection.getRangeElements();
    for (const rangeElement of elements) {
      console.log(rangeElement);
    }
  }
}
