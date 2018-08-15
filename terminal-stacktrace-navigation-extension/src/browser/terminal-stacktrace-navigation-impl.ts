/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { inject, injectable, postConstruct } from "inversify";
import { StatefulWidget } from '@theia/core/lib/browser';
import { TerminalWidgetImpl } from "@theia/terminal/lib/browser/terminal-widget-impl";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { FileSystem } from "@theia/filesystem/lib/common";
import { EditorManager, Position } from '@theia/editor/lib/browser';
import { FileSearcherService } from "../common/file-searcher-service";
import URI from "@theia/core/lib/common/uri";

@injectable()
export class TerminalStacktraceNavigationImpl extends TerminalWidgetImpl implements StatefulWidget {

    @inject(WorkspaceService) protected readonly workspaceService!: WorkspaceService;
    @inject(FileSystem) protected readonly fileSystem!: FileSystem;
    @inject(EditorManager) protected readonly editorManager!: EditorManager;
    @inject(FileSearcherService) protected readonly fileSearcherService!: FileSearcherService;

    @postConstruct()
    protected init(): void {
        super.init();

        const regExp = new RegExp("at (.*)\\..*\\((.*)\\.java:(\\d+)\\)");
        this.term.registerLinkMatcher(regExp, async (event: MouseEvent, uri: string) => {
            const regExpGroups = regExp.exec(uri);
            if (regExpGroups != null) {
                const className = regExpGroups[2];
                const fileName = className + ".java";
                const lineNumber = +regExpGroups[3];

                const uris: string[] = await this.fileSearcherService.search(fileName);
                for (const uri of uris) {
                    console.debug(uri);
                }

                for (const uri of uris) {
                    this.editorManager.open(new URI(uri), {
                        selection: { start: Position.create(lineNumber - 1, 0) }
                    });
                }
            }
        });
    }
}