// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const clipboardy = require('clipboardy');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.copyPathToFunction', function () {
		// The code you place here will be executed every time your command is executed

		const { fileName, uri } = vscode.window.activeTextEditor.document;
		const path = vscode.workspace.asRelativePath(fileName);
		const { line: cursorLine } = vscode.window.activeTextEditor.selection.start;
		// https://code.visualstudio.com/api/references/vscode-api#Clipboard

		async function run () {
			// Display a message box to the user
			let symbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", uri);

			if (!symbols) {
				vscode.window.showErrorMessage('No Symbols Found');
				return;
			}

			const classSymbols = symbols.filter(symbol => symbol.kind === 4)

			const classSymbol = classSymbols.find(symbol => {
				const {
					range: {
						start: { line: startLine },
						end: { line: endLine },
					},
				} = symbol;

				return startLine <= cursorLine && cursorLine <= endLine;
			});

			if (!classSymbol) {
				vscode.window.showErrorMessage('CursorLine Not Within Class');
				return;
			}

			const methodSymbols = classSymbol.children.filter(symbol => symbol.kind === 5);

			const methodSymbol = methodSymbols.find(symbol => {
				const {
					range: {
						start: { line: startLine },
						end: { line: endLine },
					},
				} = symbol;

				return startLine <= cursorLine && cursorLine <= endLine;
			})

			if (!methodSymbol) {
				vscode.window.showErrorMessage('CursorLine Not Within Class');
				return;
			}

			const outputString = `${path}:${classSymbol.name}.${methodSymbol.name}`;

			vscode.window.showInformationMessage(`copied: "${outputString}"`);
			clipboardy.writeSync(outputString);
		};
		run();
	});
	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
