/**
 * @OnlyCurrentDoc
 */

function onOpen(e) {
  DocumentApp.getUi()
    .createMenu("Markdown Converter")
    .addItem("Convert", "convertMarkdown")
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

type TextData = {
  isText: true;
  isPartial: boolean;
  element: GoogleAppsScript.Document.Element;
  start: number;
  end: number;
  plainText: string;
};

type NonTextData = {
  isText: false;
  element: GoogleAppsScript.Document.Element;
};

type ElementData = TextData | NonTextData;

/**
 * Get element data from the range element.
 * @param rangeElement Range element.
 */
function getElementData(
  rangeElement: GoogleAppsScript.Document.RangeElement
): ElementData {
  const element = rangeElement.getElement();
  const elementType = element.getType();

  if (rangeElement.isPartial()) {
    const start = rangeElement.getStartOffset();
    const end = rangeElement.getEndOffsetInclusive();
    const plainText = element
      .asText()
      .getText()
      .substring(start, end + 1);

    return { element, isText: true, isPartial: true, start, end, plainText };

  } else if (elementType === DocumentApp.ElementType.PARAGRAPH || elementType === DocumentApp.ElementType.TEXT) {
    const plainText = (element as GoogleAppsScript.Document.Text)
      .asText()
      .getText();
    return {
      element,
      isText: true,
      isPartial: false,
      start: 0,
      end: plainText.length - 1,
      plainText,
    };
  } else {
    // non-text element, store it as is
    return { element, isText: false };
  }
}


const renderer: marked.Renderer = {

  options: {},

  // Block level renderer methods
  code: (code, infostring, escaped) => {
    return code;
  },

  blockquote: (quote) => {
    return quote;
  },

  html: (html) => {
    return html;
  },

  heading: (text, level) => {
    return text;
  },

  hr: () => '',

  list: (body, ordered, start) => '',

  listitem: (text) => '',

  checkbox: (checked) => '',

  paragraph: (text) => '',

  table: (header, body) => '',

  tablerow: (content) => '',

  tablecell: (content, flags) => '',

  // Inline level renderer methods
  strong: (text) => text,

  em: (text) => text,

  codespan: (code) => code,

  br: () => '',

  del: (text) => text,

  link: (href, title, text) => title,

  image: (href, title, text) => text,

  text: (text) => text,
}

/**
 * Convert selected elements to markdown.
 */
function convertMarkdown() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (selection) {
    const elements = selection.getRangeElements();

    const textDatas = elements.map(getElementData);

    const rawText = textDatas.map(data => data.isText ? data.plainText : '[NON_TEXT]').join('\n');
    marked.use({ renderer });

    const html = marked(rawText);
    console.log(html);
  }
}
