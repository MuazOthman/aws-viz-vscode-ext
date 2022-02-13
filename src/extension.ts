import * as vscode from "vscode";
import { normalize } from "path";
import { listFilesToBeUpdated, updateWorkspace } from "@muazothman/aws-viz";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "aws-viz.generate",
    async (uri: vscode.Uri) => {
      let diagramFilePath: string | undefined = "";
      if (uri === undefined) {
        console.log(
          "workspace",
          JSON.stringify(
            {
              notebookDocuments: vscode.workspace.notebookDocuments,
            },
            null,
            2
          )
        );

        diagramFilePath = vscode.window.activeTextEditor?.document.fileName;
      } else {
        diagramFilePath = normalize(uri.path);
      }
      if (!diagramFilePath) {
        vscode.window.showErrorMessage(`Please select a diagram file`);
        return;
      }
      const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.path;
      console.log("workspaceRoot", workspaceRoot);
      console.log("diagramFilePath", diagramFilePath);

      const filesToBeUpdated = listFilesToBeUpdated(
        diagramFilePath,
        workspaceRoot
      );

      let confirmationText = "template.yaml and ";
      if (filesToBeUpdated.find((f) => f === "template.yaml")) {
        confirmationText += `${filesToBeUpdated.length - 1} other file(s)`;
      } else {
        confirmationText = `Please confirm: ${
          filesToBeUpdated.length - 1
        } file(s)`;
      }

      if (filesToBeUpdated.length === 0) {
        vscode.window.showErrorMessage(
          `No files to create/update, please note that if you need to regenerate a file you can delete it and run the generate command again`
        );
        return;
      }

      await vscode.window.showQuickPick(
        ["Cancel", `Yes, create/update ${confirmationText}`],
        {
          placeHolder: `Please confirm: ${confirmationText} will be created/updated`,
          onDidSelectItem: (item) => {
            console.log("User selected option: ", item);

            if (item) {
              const itemAsString = typeof item === "string" ? item : item.label;
              if (itemAsString.startsWith("Yes")) {
                console.log(
                  `Creating/updating ${filesToBeUpdated.length} files`
                );
                try {
                  updateWorkspace(diagramFilePath!, workspaceRoot);
                  vscode.window.showInformationMessage(
                    `Created/updated ${filesToBeUpdated.length} files`
                  );
                } catch (err) {
                  console.log(err);
                  vscode.window.showInformationMessage(
                    `Failed creating/updating ${filesToBeUpdated.length} files`
                  );
                }
              }
            }
          },
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
