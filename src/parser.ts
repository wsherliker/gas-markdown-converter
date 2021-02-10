export type CodeBlockAction = {
  type: "codeblock";
  line: number;
  numOfLines: number;
};

export type InlineAction = {
  type: "bold" | "italic" | "code";
  line: number;
  startPos: number;
  length: number;
};

export type LineData = {
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

/**
 * Mask str with actions so that the parts that already handled by the actions won't be considered in later replacements
 * @param actions
 * @param str
 */
function maskInlineActions(actions: InlineAction[], str: string) {
  return actions.reduce((acc: string, action: InlineAction) => {
    return (
      acc.slice(0, action.startPos) +
      "_".repeat(action.length) +
      acc.slice(action.startPos + action.length)
    );
  }, str);
}

type ReplaceFunction = (line: number, startPos: number, raw: string) => { actions: InlineAction[]; masked: string };

function replaceBold(
  line: number,
  startPos: number,
  raw: string
) {
  const matches = matchAll(/\*\*(?:[^*]+?)\*\*/g, raw);
  const actions = matches.map(
    (m) =>
      ({
        type: "bold",
        line,
        startPos: startPos + m.index,
        length: m[0].length,
      } as InlineAction)
  );

  const masked = maskInlineActions(actions, raw);
  return {actions, masked};
}

function replaceItalic(
  line: number,
  startPos: number,
  raw: string
) {
  const matches = matchAll(/\*(?:[^*]+?)\*/g, raw).filter((m) => {
    // filter out '**bold**' since GAS does not support lookbehind
    const start = m.index;
    const end = m.index + m[0].length;
    if (m.index === 0 || m.index + m[0].length === raw.length - 1) {
      return true;
    }

    if (raw.charAt(start - 1) === "*" && raw.charAt(end) == "*") {
      return false;
    }

    return true;
  });

  const actions = matches.map((m) => ({
    type: "italic",
    line,
    startPos: m.index,
    length: m[0].length,
  } as InlineAction));

  const masked = maskInlineActions(actions, raw);
  return {actions, masked};
}

function replaceCode(line: number, startPos: number, raw: string) {
  const matches = matchAll(/`(?:[^`]+?)`/g, raw);
  const actions = matches.map((m) => ({
    type: "code",
    line,
    startPos: m.index,
    length: m[0].length,
  } as InlineAction));

  const masked = maskInlineActions(actions, raw);
  return {actions, masked};

}

/**
 * Pipeline given replace functions. Since the replace function has two output: `actions` and `masked`,
 * some tricks are required to execute them sequentially.
 * @param funcs 
 * @param line 
 * @param startPos 
 * @param raw 
 */
function pipeReplaceFunctions(funcs: ReplaceFunction[], line: number, startPos: number, raw: string) {
  const { allActions, str } = funcs.reduce<{ allActions: InlineAction[], str: string}>(({ allActions, str }, f) => {
    const { actions, masked } = f(line, startPos, str);
    return { allActions: [...allActions, ...actions], str: masked}
  }, { allActions: [], str: raw });

  return { actions: allActions, masked: str };
}

function replaceInlineMarkdown(line: number, startPos: number, raw: string): InlineAction[] {
  const { actions } = pipeReplaceFunctions([replaceBold, replaceItalic, replaceCode], line, startPos, raw);
  actions.sort((a, b) => a.startPos - b.startPos);
  return actions;
}

function parseMarkdown(lines: Array<LineData>) {
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

    const inlineActions = replaceInlineMarkdown(i, lines[i].startIndex, lines[i].raw);
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
  parseMarkdown,
  maskInlineActions,
};
