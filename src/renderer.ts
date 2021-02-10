type CodeBlockAction = {
  type: "codeblock";
  line: number;
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
            line: i,
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
  return matchAll(/\*\*(?:[^*]+?)\*\*/g, line.raw).map((m) => ({
    type: "bold",
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceItalic(index: number, line: LineData): InlineAction[] {
  return matchAll(/(?<!\*)\*(?:[^*]+?)\*(?!\*)/g, line.raw).map((m) => ({
    type: "italic",
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceCode(index: number, line: LineData): InlineAction[] {
  return matchAll(/`(?:[^`]+?)`/g, line.raw).map((m) => ({
    type: "code",
    line: index,
    startPos: m.index,
    length: m[0].length,
  }));
}

function replaceInlineMarkdown(index: number, line: LineData): InlineAction[] {
  const actions = [
    ...replaceBold(index, line),
    ...replaceItalic(index, line),
    ...replaceCode(index, line),
  ];
  actions.sort((a, b) => a.startPos - b.startPos);
  console.log(actions);
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
        (cba) => cba.line <= i && i < cba.line + cba.numOfLines
      )
    ) {
      continue;
    }

    const inlineActions = replaceInlineMarkdown(i, lines[i]);
    actions = actions.concat(inlineActions);
  }
  
  actions.sort((a, b) => a.line - b.line);
  return actions;
}

// exports are only for unit tests
export default {
  replaceBold,
  replaceItalic,
  replaceCode,
  replaceInlineMarkdown,
  replaceCodeBlock,
  renderMarkdown,
};
