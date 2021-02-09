import marked from '../src/vendor/marked';
import { renderer } from '../src/renderer';

describe('renderer', () => {
  it('should render bold correctly', () => {
    // marked.use({ renderer });
    const options = {};
    const tokens = marked.lexer('regular **bold** regular\nline2\nline3\n\nline4', options);

    const html = marked.parser(tokens, options);
    console.log(JSON.stringify(tokens));
    console.log(html);

    expect(html).toEqual('bold');

  });
})