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

To start local development, first install clasp:

```
npm install -g @google/clasp
```

Then go to your Google Drive, and create a Google Docs. Select **Tools -> Script Editor** to open the Google Apps Script editor.

In the Google Apps Script editor, open the **Project Settings** from the left menu. Find the **Script ID** in the project settings.

Go back to your cloned repo and create a `.clasp.json` in the root. Replace the `scriptId` with the Script ID found in last step.

```
{
  "scriptId":"<your_script_idd>",
  "rootDir": "src/",
  "fileExtension": "ts"
}
```

Now you should be able to use `clasp push` to push this repo to your google docs.


## Project Guideline

The goal of this project is to solve some pain points when using Google Docs to compose technical documents. Therefore the feature requirements are:

- provide a convenient way to write source code, both inline and code block
- must integrate with native styles, so that this add-on is not required for viewing the document

It does not intend to become a full featured Markdown editor / converter. Thus, the following features will *never* be supported, since Google Docs already have better solutions, or already convenient enough:

- Ordered / unordered list: Google Docs support realtime conversion. Lists can be created simply by entering `* `, `- `, or `1. `.
- Table / Image: Native composing tool is powerful enough.

Other markdown-related Add-ons in the marketplace usually convert Markdown document into HTML format, but none of them convert Markdown to Google Docs native styles.

## Contribution

Any contributions, including PRs and issues, are welcome!
