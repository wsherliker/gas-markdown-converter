import renderMarkdown from '../src/markdown-renderer';

describe('renderer', () => {
  it('should render plain text', () => {
    const formatData = renderMarkdown('text');
    expect(formatData).toEqual([]);
  });

  it('should render bold text', () => {
    const formatData = renderMarkdown('**bold**');
    expect(formatData).toEqual([
      {
        line: 0,
        startPos: 2,
        length: 4,

        isBold: true,

        deletions: [
          { start: 0, length: 2 },
          { start: 6, length: 2 },
        ]
      }
    ]);
  });

  it('should render italic', () => {
    const formatData = renderMarkdown('*italic*');
    expect(formatData).toEqual([
      {
        line: 0,
        startPos: 1,
        length: 6,

        isItalic: true,

        deletions: [
          { start: 0, length: 1 },
          { start: 7, length: 1 },
        ]
      }
    ]);
  });

  it('should render mixture of bold and italic', () => {
    const formatData = renderMarkdown('plain text *italic* plain text **bold** plain text');
    expect(formatData).toEqual([
      {
        line: 0,
        startPos: 12,
        length: 6,

        isItalic: true,

        deletions: [
          { start: 11, length: 1 },
          { start: 18, length: 1 },
        ]
      },

      {
        line: 0,
        startPos: 33,
        length: 4,

        isBold: true,

        deletions: [
          { start: 31, length: 2 },
          { start: 37, length: 2 },
        ]
      },
    ]);
  });

  it('should handle multi rows', () => {
    const formatData = renderMarkdown('1\n2**bo\nld**\n3');

    expect(formatData).toEqual([
      {
        line: 1,
        startPos: 3,
        length: 4,
        isBold: true,
        deletions: [
          { start: 1, length: 2 },
          { start: 6, length: 2 },
        ],
      }
    ])
  });

  it.only('should render bold italic', () => {

    const formatData = renderMarkdown('***bold italic***');
    expect(formatData).toEqual([
      {
        line: 0,
        startPos: 3,
        length: 11,

        isBold: true,
        isItalic: true,
        deletions: [
          { start: 0, length: 1 },
          { start: 16, length: 1 },
          { start: 1, length: 2 },
          { start: 14, length: 2 },
        ]
      }
    ]);
  });
})