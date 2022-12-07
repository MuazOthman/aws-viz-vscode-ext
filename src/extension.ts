import * as vscode from "vscode";
import { normalize, join } from "path";
import { existsSync, readFileSync } from "fs";
import { AWSViz, AWSVizOptions } from "@muazothman/aws-viz";

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("AWS-Viz");

  const logMessage = (message: string) => {
    outputChannel.appendLine(message);
  };

  const disposable = vscode.commands.registerCommand(
    "aws-viz.generate",
    async (uri: vscode.Uri) => {
      let diagramFilePath: string | undefined = "";
      if (uri === undefined) {
        logMessage("workspace:");
        logMessage(
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
      logMessage(`workspaceRoot: ${workspaceRoot}`);
      logMessage(`diagramFilePath: ${diagramFilePath}`);

      const configFilePath = join(workspaceRoot, "aws-viz.config.json");

      let config: AWSVizOptions = {};

      if (existsSync(configFilePath)) {
        config = JSON.parse(readFileSync(configFilePath, "utf8"));
      }

      logMessage("config:");
      logMessage(JSON.stringify(config, null, 2));

      config.afterAppCompiled = (scenario, app) => {
        if (scenario === "listFilesToBeUpdated") {
          for (let i = 0; i < app.components.length; i++) {
            const c = app.components[i];
            logMessage(
              `${c.toString()}: (${Object.keys(c.properties)
                .map((p) => `${p}: ${c.properties[p]}`)
                .join(", ")})`
            );
            for (let j = 0; j < c.outboundConnections.length; j++) {
              const conn = c.outboundConnections[j];
              const connectionString = conn.label
                ? `${conn.target} labeled: "${conn.label}"`
                : conn.target;
              logMessage(`\t=> ${connectionString}`);
            }
          }
        }
      };

      const awsViz = new AWSViz(config);

      const filesToBeUpdated = awsViz.listFilesToBeUpdated(
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
            logMessage(`User selected option: ${item}`);

            if (item) {
              const itemAsString = typeof item === "string" ? item : item.label;
              if (itemAsString.startsWith("Yes")) {
                logMessage(
                  `Creating/updating ${filesToBeUpdated.length} files`
                );
                try {
                  awsViz.updateWorkspace(diagramFilePath!, workspaceRoot);
                  vscode.window.showInformationMessage(
                    `Created/updated ${filesToBeUpdated.length} files`
                  );
                } catch (err) {
                  logMessage(`Error: ${JSON.stringify(err)}`);
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
export function deactivate() {
  outputChannel?.dispose();
}
