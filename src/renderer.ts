type CodeBlockAction = {
  type: "codeblock";
  startLine: number;
  numOfLines: number;
};

type InlineAction = {
  type: "bold" | "italic" | "code";
  line: number;
  startPos: number;
  length: number;
};

type LineData = {
  text: GoogleAppsScript.Document.Text;
  startIndex: number;
  endIndex: number;
  raw: string;
};

function replaceCodeBlock(lines: LineData[]): CodeBlockAction[] {
  const actions = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // skip partial lines
    if (line.startIndex > 0) {
      i++;
      continue;
    }

    // Found start tag, look for end tag
    if (line.raw.trim() === "```") {
      let j = i + 1;
      while (j < lines.length) {
        // Found end tag, return action
        if (lines[j].raw.trim() == "```") {
          actions.push({
            type: "codeblock",
            startLine: i,
            numOfLines: j - i + 1,
          });

          // continue searching for next code block from next line
          i = j + 1;
          break;
        }

        j++;
      }

      // if end tag not found, then no need to search for other start tags
      if (j >= lines.length) {
        break;
      }
    }

    i++;
  }

  return actions;
}

function matchAll(regex: RegExp, str: string) {

  const matches = [];
  let m: RegExpExecArray;

  while ((m = regex.exec(str)) !== null) {
    matches.push(m);
  }

  return matches;
}

function replaceBold(index: number, line: LineData): InlineAction[] {
  return matchAll(/\*\*(?:.*?)\*\*/g, line.raw).map(m => ({
    type: 'bold',
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceItalic(index: number, line: LineData): InlineAction[] {
  return matchAll(/\*(?:.*?)\*/g, line.raw).map(m => ({
    type: 'italic',
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceCode(index: number, line: LineData): InlineAction[] {
  return matchAll(/`(?:.*?)`/g, line.raw).map(m => ({
    type: 'code',
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceInlineMarkdown(index: number, line: LineData): InlineAction[] {
  let actions = [];
  actions = actions.concat(replaceBold(index, line));
  actions = actions.concat(replaceItalic(index, line));
  actions = actions.concat(replaceCode(index, line));
  return actions;
}

function renderMarkdown(lines: Array<LineData>) {
  let actions = [];

  const codeBlockActions = replaceCodeBlock(lines);

  actions = actions.concat(codeBlockActions);

  for (let i = 0; i < lines.length; i++) {
    // Skip line if line[i] is already converted to a code block
    if (
      codeBlockActions.some(
        (cba) => cba.startLine <= i && i < cba.startLine + cba.numOfLines
      )
    ) {
      continue;
    }

    const inlineActions = replaceInlineMarkdown(i, lines[i]);
    actions = actions.concat(inlineActions);
  }
}

// exports are only for unit tests
export default {
  replaceBold,
  replaceItalic,
  replaceCode,
  replaceInlineMarkdown,
  replaceCodeBlock,
};
