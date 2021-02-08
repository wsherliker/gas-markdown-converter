export const renderer: marked.Renderer = {

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
  strong: (text) => {console.log('strong'); return text; },

  em: (text) => text,

  codespan: (code) => code,

  br: () => '',

  del: (text) => text,

  link: (href, title, text) => title,

  image: (href, title, text) => text,

  text: (text) => text,
}
