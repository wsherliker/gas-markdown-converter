// a position in the text.
type Position = {
  para: number;
  char: number;
}

type BlockElement = {
  start: Position; 
  end: Position;
  text: string;
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

  paragraph: (text) => text,

  table: (header, body) => '',

  tablerow: (content) => '',

  tablecell: (content, flags) => '',

  // Inline level renderer methods
  strong: (text) => {
    return {
      isBold: true,
      children: text,
    }
  },

  em: (text) => {
    return {
      isBold: true,
      children: text,
    }
  },

  codespan: (code) => code,

  br: () => '',

  del: (text) => text,

  link: (href, title, text) => title,

  image: (href, title, text) => text,

  text: (text) => {
    return text;
  },
}

export default renderer;