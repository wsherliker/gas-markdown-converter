/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

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
  DocumentApp.getUi().createMenu('Markdown')
      .addItem('Convert', 'convertSelectedText')
      .addToUi();
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

function escapeTag(tag) {
  return tag.replace(/([\.\*\?])/g, "\\$1")
}

/**
 * Replace one markdown element in the given `rangeElement`.
 * 
 * @return {bool} true if a replacement occured; otherwise false
 */
function replaceMarkdownElement(rangeElement, { tag, styleCallback, onFinish = null }) {
  const { text, startIndex, endIndex, string} = getTextToProcess(rangeElement);

  // find replaceable range
  const escapedTag = escapeTag(tag);
  const regex = RegExp(escapedTag + '(?:.|[\r\n])+?' + escapedTag);
  const match = string.match(regex);

  if (match) {
    const matchedText = match[0];
    const index = match.index;
    const start = startIndex + index;
    const end = start + matchedText.length - 1;

    styleCallback(text, start, end);

    text.deleteText(end - tag.length + 1, end);
    text.deleteText(start, start + tag.length - 1);

    if (onFinish) {
      onFinish(text, start, end - tag.length * 2);
    }

    return true;
  } else {
    return false;
  }
}

function replaceMonospace(rangeElement) {
  return replaceMarkdownElement(rangeElement, {
    tag: '`', 
    styleCallback: function(text, start, end) {
      text.setFontFamily(start, end, "Roboto Mono");
      text.setForegroundColor(start, end, "#cc0000");
      text.setBackgroundColor(start, end, "#f3f3f3");
    },
  });
}

function replaceBold(rangeElement) {
  return replaceMarkdownElement(rangeElement, {
    tag: '**', 
    styleCallback: function(text, start, end) {
      text.setBold(start, end, true);
    },
  });
}

function replaceItalic(rangeElement) {
  return replaceMarkdownElement(rangeElement, {
    tag: '*', 
    styleCallback: function(text, start, end) {
      text.setItalic(start, end, true);
    },
  });
}

function replaceCodeBlock(rangeElement) {
  const { string} = getTextToProcess(rangeElement);
  let paragraph = rangeElement.getElement();

  if (!paragraph) {
    return false;
  }

  // find paragraph
  while (paragraph.getType() != DocumentApp.ElementType.PARAGRAPH) {
    paragraph = paragraph.getParent();
  }
  const body = paragraph.getParent();
  const pos = body.getChildIndex(paragraph);

  if (string.startsWith("```\r") && string.endsWith("\r```")) {
    const content = string.substring(4, string.length - 4);
    // insert table
    const table = body.insertTable(pos + 1, [[content]]);

    // set table style
    table.setBorderColor("#d0d0d0");
    const cell = table.getCell(0, 0);
    cell.setBackgroundColor("#f3f3f3")
    const text = cell.getChild(0).asText();
    text.setFontFamily("Roboto Mono");
    text.setFontSize(9);

    // remove paragraph
    paragraph.removeFromParent();
    return true;
  }

  return false;

  // const lines = string.split("\n");

  // let firstTagLine = -1;
  // let secondTagLine = -1;
  // for (let i = 0; i < lines.length; i++) {
  //   if (lines[i] === '```') {
  //     if (firstTagLine === -1) {
  //       firstTagLine =i;
  //     } else {
  //       secondTagLine = i;
  //       break;
  //     }
  //   }
  // }

  // if (firstTagLine !== -1 && secondTagLine !== -1) {
  //   // place everything between firstTagLine and secondTagLine into a table
  //   const start = lines.split(0, firstTagLine + 1).map(l => l.length + 1).reduce((a, b) => a + b, 0);
  //   const end = lines.split(0, secondTagLine).map(l => l.length + 1).reduce((a, b) => a + b, 0);
  // }

  // return replaceMarkdownElement(rangeElement, {
  //   tag: '```', 
  //   styleCallback: function(text, start, end) {
  //     text.setFontFamily(start, end, "Roboto Mono");
  //     text.setFontSize(start, end, 9);
  //   },
  //   onFinish: function (text, start, end) {
  //     // delete extra newlines
  //     text.deleteText(end, end);
  //     text.deleteText(start, start);
  //   },
  // });
}


function getTextToProcess(rangeElement) {
  if (rangeElement.isPartial()) {
    const text = rangeElement.getElement().asText();
    const startIndex = rangeElement.getStartOffset();
    const endIndex = rangeElement.getEndOffsetInclusive();
    const raw = text.getText().substring(startIndex, endIndex + 1);
    return { text, startIndex, endIndex, raw };
  } else {
    const element = rangeElement.getElement();
    if (element.editAsText) {
      const text = element.asText();
      const raw = text.getText();
      return { text, startIndex: 0, endIndex: raw.length - 1, raw };
    }
  }
}

function replaceMarkdownForRangeElement(rangeElement) {
  if (!replaceCodeBlock(rangeElement)) {
    while (replaceMonospace(rangeElement));
    while (replaceBold(rangeElement));
    while (replaceItalic(rangeElement));
  }

}

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 *
 * @return {Array.<string>} The selected text.
 */
function convertSelectedText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    const elements = selection.getRangeElements();
    const texts = elements.map(e => getTextToProcess(e));

    const actions = renderMarkdown(texts);

    // for (const rangeElement of elements) {
    //   replaceMarkdownForRangeElement(rangeElement);
    // }

  }
  return [];
}

