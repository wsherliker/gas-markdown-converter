import renderer from "../src/renderer";

const makeLines = (text) => {
  return text.map((t) => ({
    startIndex: 0,
    endIndex: t.length,
    raw: t,
  }));
};

describe("replaceCodeBlock", () => {
  it("should do nothing when code block does not exist", () => {
    const lines = makeLines(["abcd", "abcd"]);
    const actions = renderer.replaceCodeBlock(lines);
    expect(actions).toEqual([]);
  });

  it("should replace code block", () => {
    const lines = makeLines(["```", "Hello, world", "```"]);

    const actions = renderer.replaceCodeBlock(lines);

    expect(actions).toEqual([
      {
        type: "codeblock",
        line: 0,
        numOfLines: 3,
      },
    ]);
  });

  it("should replace multiple code block", () => {
    const lines = makeLines([
      "regular text", // 0
      "```", // 1
      "Hello, world", // 2
      "```", // 3
      "regular text", // 4
      "```", // 5
      "block 2", // 6
      "line 2", // 7
      "```", // 8
      "abc", // 9
    ]);

    const actions = renderer.replaceCodeBlock(lines);

    expect(actions).toEqual([
      {
        type: "codeblock",
        line: 1,
        numOfLines: 3,
      },
      {
        type: "codeblock",
        line: 5,
        numOfLines: 4,
      },
    ]);
  });

  it("should ignore if the first line is partial", () => {
    const lines = makeLines(["```", "test", "```"]);
    lines[0].startIndex = 10;
    const actions = renderer.replaceCodeBlock(lines);
    expect(actions).toEqual([]);
  });
});

describe("replaceBold", () => {
  it("should do nothing if no bold", () => {
    const lines = makeLines(["test"]);
    const actions = renderer.replaceBold(0, lines[0]);
    expect(actions).toEqual([]);
  });

  it("should not replace empty tags", () => {
    const lines = makeLines(["****"]);
    const actions = renderer.replaceCodeBlock(lines);
    expect(actions).toEqual([]);
  });

  it("should replace bold", () => {
    const lines = makeLines(["plain **bold** plain"]);
    const actions = renderer.replaceBold(0, lines[0]);
    expect(actions).toEqual([
      {
        type: "bold",
        line: 0,
        startPos: 6,
        length: 8,
      },
    ]);
  });

  it("should replace multiple bold", () => {
    const lines = makeLines(["plain **bold** plain **bold2**"]);
    const actions = renderer.replaceBold(1, lines[0]);
    expect(actions).toEqual([
      {
        type: "bold",
        line: 1,
        startPos: 6,
        length: 8,
      },
      {
        type: "bold",
        line: 1,
        startPos: 21,
        length: 9,
      },
    ]);
  });
});

describe("replaceItalic", () => {
  it("should do nothing if no italic", () => {
    const lines = makeLines(["test"]);
    const actions = renderer.replaceItalic(0, lines[0]);
    expect(actions).toEqual([]);
  });

  it("should not replace empty tags", () => {
    const lines = makeLines(["**"]);
    const actions = renderer.replaceCodeBlock(lines);
    expect(actions).toEqual([]);
  });

  it("should replace italic", () => {
    const lines = makeLines(["plain *italic* plain"]);
    const actions = renderer.replaceItalic(0, lines[0]);
    expect(actions).toEqual([
      {
        type: "italic",
        line: 0,
        startPos: 6,
        length: 8,
      },
    ]);
  });

  it("should replace multiple italic", () => {
    const lines = makeLines(["plain *italic* plain *italic2*"]);
    const actions = renderer.replaceItalic(1, lines[0]);
    expect(actions).toEqual([
      {
        type: "italic",
        line: 1,
        startPos: 6,
        length: 8,
      },
      {
        type: "italic",
        line: 1,
        startPos: 21,
        length: 9,
      },
    ]);
  });
});

describe("replaceCode", () => {
  it("should do nothing if no code", () => {
    const lines = makeLines(["test"]);
    const actions = renderer.replaceCode(0, lines[0]);
    expect(actions).toEqual([]);
  });

  it("should not replace empty tags", () => {
    const lines = makeLines(["``"]);
    const actions = renderer.replaceCodeBlock(lines);
    expect(actions).toEqual([]);
  });

  it("should replace code", () => {
    const lines = makeLines(["plain `code` plain"]);
    const actions = renderer.replaceCode(0, lines[0]);
    expect(actions).toEqual([
      {
        type: "code",
        line: 0,
        startPos: 6,
        length: 6,
      },
    ]);
  });

  it("should replace multiple code", () => {
    const lines = makeLines(["plain `code` plain `code2`"]);
    const actions = renderer.replaceCode(1, lines[0]);
    expect(actions).toEqual([
      {
        type: "code",
        line: 1,
        startPos: 6,
        length: 6,
      },
      {
        type: "code",
        line: 1,
        startPos: 19,
        length: 7,
      },
    ]);
  });
});

describe("replaceInlineMarkdown", () => {
  it("should replace mixed markdown", () => {
    const lines = makeLines(["plain `code` **bold** *italic*"]);
    const actions = renderer.replaceInlineMarkdown(2, lines[0]);
    expect(actions).toEqual([
      {
        type: "code",
        line: 2,
        startPos: 6,
        length: 6,
      },
      {
        type: "bold",
        line: 2,
        startPos: 13,
        length: 8,
      },
      {
        type: "italic",
        line: 2,
        startPos: 22,
        length: 8,
      },
    ]);
  });
});

describe("replaceMarkdown", () => {
  it("should replace both code blocks and mixed markdown", () => {
    const lines = makeLines([
      "plain **bold** `code`",
      "```",
      "code block",
      "```",
      "*italic*",
    ]);
    const actions = renderer.renderMarkdown(lines);

    expect(actions).toEqual([
      {
        type: "bold",
        line: 0,
        startPos: 6,
        length: 8,
      },

      {
        type: "code",
        line: 0,
        startPos: 15,
        length: 6,
      },

      {
        type: "codeblock",
        line: 1,
        numOfLines: 3,
      },

      {
        type: "italic",
        line: 4,
        startPos: 0,
        length: 8,
      },
    ]);
  });

  it("should not replace format inside codeblock", () => {
    const lines = makeLines(["```", "**bold**", "```"]);

    const actions = renderer.renderMarkdown(lines);
    expect(actions).toEqual([
      {
        type: "codeblock",
        line: 0,
        numOfLines: 3,
      },
    ]);
  });
});
