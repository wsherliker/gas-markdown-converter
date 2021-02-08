import marked from '../src/vendor/marked';
import { renderer } from '../src/renderer';

describe('renderer', () => {
  it('should render bold correctly', () => {
    marked.use({ renderer });
    const html =marked('regular **bold** regular');

    expect(html).toEqual('bold');

    console.log(html);
  });
})