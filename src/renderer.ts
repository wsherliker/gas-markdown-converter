import { LineData, Action } from "./parser";

type DocsLineData = {
  text: GoogleAppsScript.Document.Text;
} & LineData;

function getParagraph(element: GoogleAppsScript.Document.Element) {
  while (element.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    element = element.getParent();
  }
  return element as GoogleAppsScript.Document.Paragraph;
}


function renderCodeBlock(elements: GoogleAppsScript.Document.RangeElement[]) {
  const paragraph = getParagraph(elements[0].getElement());
  if (!paragraph) {
    return;
  }

  const body: GoogleAppsScript.Document.Body = paragraph.getParent().asBody();
  const pos = body.getChildIndex(paragraph);

  // remove paragraph
  elements.forEach(e => e.getElement().removeFromParent());

  // insert table (use an empty string as a placeholder)
  const table = body.insertTable(pos + 1, [['']]);

  // remove the empty cell content placeholder
  const cell = table.getCell(0, 0);
  cell.getChild(0).removeFromParent();

  // create table content
  elements.slice(1, -1).forEach(e => {
    const text = e.getElement().asText();
    const paragraph = getParagraph(e.getElement());
    text.setFontFamily("Roboto Mono");
    text.setFontSize(9);
    cell.appendParagraph(paragraph);
  })

  // set table style
  table.setBorderColor("#d0d0d0");
  cell.setBackgroundColor("#f3f3f3")
}

function renderBold(element: GoogleAppsScript.Document.RangeElement, startPos: number, length: number) {
  const text = getTextToProcess(element).text;
  const start = startPos;
  const inclusiveEnd = start + length - 1;

  text.setBold(start, inclusiveEnd, true);
  text.deleteText(inclusiveEnd - 1, inclusiveEnd);
  text.deleteText(start, start + 1);
}

function renderItalic(element: GoogleAppsScript.Document.RangeElement, startPos: number, length: number) {
  const text = getTextToProcess(element).text;
  const start = startPos;
  const inclusiveEnd = start + length - 1;

  text.setItalic(start, inclusiveEnd, true);
  text.deleteText(inclusiveEnd, inclusiveEnd);
  text.deleteText(start, start);
}

function renderCode(element: GoogleAppsScript.Document.RangeElement, startPos: number, length: number) {
  const text = getTextToProcess(element).text;
  const start = startPos;
  const inclusiveEnd = start + length - 1;

  text.setFontFamily(start, inclusiveEnd, 'Roboto Mono');
  text.setForegroundColor(start, inclusiveEnd, '#cc0000');
  text.setBackgroundColor(start, inclusiveEnd, '#f3f3f3');
  text.deleteText(inclusiveEnd, inclusiveEnd);
  text.deleteText(start, start);
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


function renderMarkdown(elements: GoogleAppsScript.Document.RangeElement[]) {
  const lines = elements.map(e => getTextToProcess(e));
  const actions = parseMarkdown(lines);
  actions.forEach((action) => {
    // Handle current action
    switch (action.type) {
      case "codeblock":
        renderCodeBlock(elements.slice(action.line, action.line + action.numOfLines));
        break;

      case "bold":
        renderBold(elements[action.line], action.startPos, action.length);
        break;

      case "italic":
        renderItalic(elements[action.line], action.startPos, action.length);
        break;
      case "code":
        renderCode(elements[action.line], action.startPos, action.length);
        break;
      default:
        break;
    }
  });
}

export default {};
