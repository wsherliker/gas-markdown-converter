import marked from "./vendor/marked";


class MyParser extends marked.Parser {

}

const parser = new MyParser();
export default parser;