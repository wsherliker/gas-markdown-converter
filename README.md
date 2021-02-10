Markdown Converter: A Google Docs Add-on to convert Markdown syntax
===================================================================

Markdown Converter is a simple Google Docs add-on. It does only one thing: converting Markdown syntax in selected content to Google Docs styles.

## Background

The reason why Markdown Converter was created is that Google Docs does not support Markdown-style formats that allows quickly typing source codes. For example, to enter variableName, you need to first enter “varibleName”, then select the text with your mouse, and choose a monospace font from the font menu. This has to be done repeatly especially when writing technical documents.

Due to technical limitations, it is not possible to convert Markdown syntax when typing. So Markdown Converter has to choose a less convenient way, to convert selected text. Although not ideal, it still provides a lot of convenience than the native styling tools.

## Usage

Once installed, Markdown Converter creates a menu item at Add-ons > Markdown Converter.

Select **Add-ons > Markdown Converter > Start** to start the add-on sidebar. You will see there is only one “**Convert**” button in the sidebar.

Select any text that contains markdown syntax, then click the **Convert** button. Your selected text will be parsed and markdown syntax will be converted to native Google Docs styles.

> To ensure performance, don’t select large amount of text. Ideally selected text should be no more than one page.

If you are not happy with the conversion, you can always use `Ctrl-Z` (on Windows) or `Cmd-Z` (on MacOS) to undo the conversion.


## Devleopment

This project is created with [clasp](https://developers.google.com/apps-script/guides/clasp). 
