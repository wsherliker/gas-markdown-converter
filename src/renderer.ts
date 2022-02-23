import { LineData, Action } from "./parser";

type DocsLineData = {
	text: GoogleAppsScript.Document.Text;
} & LineData;

type Preference = {
	codeblockUseTable?: boolean;
	codeblockDarkMode: boolean;
};

function getRootElement(e) {
	if (e.getElement) {
		return element.getElement();
	}
	return e;
}

function getParagraph(element: Object) {
	element = getRootElement(element);
	while (element.getType() !== DocumentApp.ElementType.PARAGRAPH) {
		element = element.getParent();
	}
	return element as GoogleAppsScript.Document.Paragraph;
}

function renderCodeBlock(
	elements: GoogleAppsScript.Document.RangeElement[],
	useTable: boolean,
	darkMode: boolean
) {
	const paragraph = getParagraph(elements[0]);
	if (!paragraph) {
		return;
	}

	const body: GoogleAppsScript.Document.Body = paragraph.getParent().asBody();
	const pos = body.getChildIndex(paragraph);

	if (useTable) {
		// remove paragraph
		elements.forEach((e) => getRootElement(e).removeFromParent());

		// insert table (use an empty string as a placeholder)
		const table = body.insertTable(pos + 1, [[""]]);

		// remove the empty cell content placeholder
		const cell = table.getCell(0, 0);
		cell.getChild(0).removeFromParent();

		// create table content
		elements.slice(1, -1).forEach((e) => {
			const text = getRootElement(e).asText();
			text.setFontFamily("Roboto Mono");
			text.setFontSize(9);

			if (darkMode) {
				text.setForegroundColor("#eeeeee");
			}

			const paragraph = getParagraph(e);
			cell.appendParagraph(paragraph);
		});

		// set table style
		if (darkMode) {
			table.setBorderColor("#666666");
			cell.setBackgroundColor("#666666");
		} else {
			table.setBorderColor("#d0d0d0");
			cell.setBackgroundColor("#f3f3f3");
		}


	} else {
		// without table, simply change the font style
		elements.forEach((e) => {
			const text = getRootElement(e).asText();
			text.setFontFamily("Roboto Mono");
			text.setFontSize(9);
		});

		// remove tags
		getRootElement(elements[0]).removeFromParent();
		getRootElement(elements[elements.length - 1]).removeFromParent();
	}
}

function renderList(
	elements: GoogleAppsScript.Document.RangeElement[]
) {
	const paragraph = getParagraph(elements[0]);
	if (!paragraph) {
		return;
	}

	const body: GoogleAppsScript.Document.Body = paragraph.getParent().asBody();
	const pos = body.getChildIndex(paragraph);

	// remove paragraphs
	elements.forEach((e) => getRootElement(e).removeFromParent());

	// insert list items
	for(var i = elements.length - 1; i >= 0; i--) {
		var e = elements[i];
		var para = getParagraph(e);
		var txt = para.editAsText().getText();
		if (txt.length < 2) { continue; }
		txt = txt.substr(2);
		var li = body.insertListItem(pos, txt);
		li.setGlyphType(DocumentApp.GlyphType.BULLET);
	}
}

function renderBold(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	const inclusiveEnd = start + length - 1;

	text.setBold(start, inclusiveEnd, true);
	text.deleteText(inclusiveEnd - 1, inclusiveEnd);
	text.deleteText(start, start + 1);
}

function renderRightAlign(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	text.deleteText(start, start + 1);

	const para = getParagraph(element);
	para.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
}

function renderCenterAlign(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	text.deleteText(start, start + 1);

	const para = getParagraph(element);
	para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
}

function renderHeading(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number,
	heading: DocumentApp.ParagraphHeading,
	chars: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	text.deleteText(start, start + chars - 1);

	const para = getParagraph(element);
	para.setHeading(heading);
}

function renderItalic(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	const inclusiveEnd = start + length - 1;

	text.setItalic(start, inclusiveEnd, true);
	text.deleteText(inclusiveEnd, inclusiveEnd);
	text.deleteText(start, start);
}

function renderCode(
	element: GoogleAppsScript.Document.RangeElement,
	startPos: number,
	length: number
) {
	const text = getTextToProcess(element).text;
	const start = startPos;
	const inclusiveEnd = start + length - 1;

	text.setFontFamily(start, inclusiveEnd, "Roboto Mono");
	text.setForegroundColor(start, inclusiveEnd, "#cc0000");
	text.setBackgroundColor(start, inclusiveEnd, "#f3f3f3");
	text.deleteText(inclusiveEnd, inclusiveEnd);
	text.deleteText(start, start);
}

function getTextToProcess(rangeElement) {
	if (rangeElement.getText) {
		const raw = rangeElement.getText();
		const text = raw;
		return { text, startIndex: 0, endIndex: raw.length - 1, raw };
	} else if (rangeElement.isPartial && rangeElement.isPartial()) {
		const text = getRootElement(rangeElement).asText();
		const startIndex = rangeElement.getStartOffset();
		const endIndex = rangeElement.getEndOffsetInclusive();
		const raw = text.getText().substring(startIndex, endIndex + 1);
		return { text, startIndex, endIndex, raw };
	} else {
		const element = getRootElement(rangeElement);
		if (element.editAsText) {
			const text = element.asText();
			const raw = text.getText();
			return { text, startIndex: 0, endIndex: raw.length - 1, raw };
		}
	}
}

function renderMarkdown(
	elements: GoogleAppsScript.Document.RangeElement[],
	prefs: Preference
) {
	const { codeblockUseTable, codeblockDarkMode } = prefs;

	const lines = elements.map((e) => getTextToProcess(e));
	const actions = parseMarkdown(lines);

	for(var i = actions.length - 1; i >=0; i--) {
		action = actions[i];

		// Handle current action
		switch (action.type) {
			case "codeblock":
				renderCodeBlock(
					elements.slice(action.line, action.line + action.numOfLines),
					codeblockUseTable,
					codeblockDarkMode
				);
				break;

			case "list":
				renderList(
					elements.slice(action.line, action.line + action.numOfLines)
				);
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

			case 'rightalign':
				renderRightAlign(elements[action.line], action.startPos, action.length);
				break;

			case 'centeralign':
				renderCenterAlign(elements[action.line], action.startPos, action.length);
				break;

			case 'heading1':
				renderHeading(elements[action.line], action.startPos, action.length, DocumentApp.ParagraphHeading.HEADING1, 1);
				break;

			case 'heading2':
				renderHeading(elements[action.line], action.startPos, action.length, DocumentApp.ParagraphHeading.HEADING2, 2);
				break;

			case 'heading3':
				renderHeading(elements[action.line], action.startPos, action.length, DocumentApp.ParagraphHeading.HEADING3, 3);
				break;

			default:
				break;
		}
	}
}

export default {};
