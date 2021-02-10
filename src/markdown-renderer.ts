import marked from "marked";
import renderer from "./renderer";

type Deletion = {
  start: number;
  length: number;
};

type FormatEntry = {
  line: number;
  startPos: number;
  length: number;

  isBold?: boolean;
  isItalic?: boolean;
  isCode?: boolean;

  deletions?: Deletion[];

  children?: Array<FormatEntry>;
};

type Token = {
  type: string;
  raw: string;
  text: string;
  tokens: Token[];
};

class Parser {
  parse(tokens: Array<Token>) {
    const formatData: FormatEntry[] = [];

    let currentLine = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (token.type) {
        case "space": {
          continue;
        }

        case "hr": {
          continue;
        }

        case "heading": {
          continue;
        }

        case "code": {
          continue;
        }

        case "table": {
          continue;
        }

        case "blockquote": {
          continue;
        }

        case "list": {
          continue;
        }

        case "html": {
        }

        case "paragraph": {
          this.parseInline(currentLine, 0, token.tokens).forEach((entry) =>
            formatData.push(entry)
          );
        }

        case "text": {
        }

        default: {
        }
      }

      currentLine += token.raw.split("\n").length - 1;
    }

    return formatData;
  }

  parseInline(line: number, initialPos: number, tokens: Array<Token>) {
    const formatData: Array<FormatEntry> = [];

    let currentPos = initialPos;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (token.type) {
        case "text": {
          formatData.push({
            line,
            startPos: currentPos,
            length: token.raw.length,
          });

          break;
        }

        case "strong": {
          formatData.push({
            line,
            startPos: currentPos,
            length: token.raw.length,
            isBold: true,

            deletions: [
              { start: currentPos, length: 2 },
              { start: currentPos + token.raw.length - 2, length: 2 },
            ],

            children: this.parseInline(line, currentPos + 2, token.tokens),
          });
          break;
        }

        case "em": {
          formatData.push({
            line,
            startPos: currentPos,
            length: token.raw.length,
            isItalic: true,

            deletions: [
              { start: currentPos, length: 1 },
              { start: currentPos + token.raw.length - 1, length: 1 },
            ],

            children: this.parseInline(line, currentPos + 1, token.tokens),
          });
          break;
        }
      }

      currentPos += token.raw.length;
    }

    return this.flattenFormat(formatData);
  }

  flattenFormat(formatData: Array<FormatEntry>): Array<FormatEntry> {
    let entries = [];
    formatData.forEach((entry) => {
      if (entry.children && entry.children.length > 0) {
        const flattenedChildren = this.flattenFormat(entry.children);

        entries = entries.concat(this.mergeFormat(entry, flattenedChildren));
      } else {
        entries.push(entry);
      }
    });

    return entries;
  }

  /**
   * Merge the parent format into children.
   */
  mergeFormat(
    parent: FormatEntry,
    children: Array<FormatEntry>
  ): Array<FormatEntry> {
    return children.map((child, i) => ({
      ...child,
      isBold: parent.isBold || child.isBold,
      isItalic: parent.isItalic || child.isItalic,
      isCode: parent.isCode || child.isCode,
      deletions: (i === 0) ? parent.deletions.concat(child.deletions) : undefined,
    }));
  }
}

function removeEmptyFormatEntries(formatData: Array<FormatEntry>) {
  return formatData.filter(entry => entry.isBold || entry.isItalic || entry.isCode);
}


function renderMarkdown(text) {
  const options = {};
  const tokens = marked.lexer(text, options);

  const parser = new Parser();
  const formatData = parser.parse((tokens as unknown) as Token[]);


  // marked.use({ renderer });
  // const formatData = marked(text);
  return removeEmptyFormatEntries(formatData);
}

export default renderMarkdown;
