# AWS-Viz

Generate Typescript and SAM template code for an AWS cloud-native serverless applications from diagrams.

## Features

The diagrams supported by this tool can be created and edited using the free open-source tool from [diagrams.net](https://www.diagrams.net) (formerly known as [draw.io](https://draw.io)).

Check [here](https://github.com/MuazOthman/aws-viz/tree/master/Sample%20Files) for sample diagram files you can use.

To use AWS-Viz you can either:

- Right click the diagram file (must have the extension `.drawio`) and choose `AWS-Viz: Generate/Update Code`.
- Open the diagram file (must have the extension `.drawio`) and choose the code generation icon in the menu item on its top-right. You can optionally install the [Draw.io Integration VS Code extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio).

## Requirements

AWS-Viz has no specific requirements, but keep in mind:

1. To deploy the code generated by AWS-Viz, you will need to have an [AWS account](https://aws.amazon.com) and have the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) installed.
2. The code generated by AWS-Viz needs to be built locally, this requires [NodeJS 14 or newer](https://nodejs.org) and NPM (which is included with NodeJS installation).

## Notice of Non-Affiliation and Disclaimer

AWS-Viz is not affiliated, associated, authorized, endorsed by, or in any way officially connected with AWS nor diagrams.net.
