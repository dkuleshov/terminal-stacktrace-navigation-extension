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

import { inject, injectable } from 'inversify';
import { FileSearcherService } from "../common/file-searcher-service";
import { FileSystem } from "@theia/filesystem/lib/common";
import { WorkspaceServer } from "@theia/workspace/lib/common";

@injectable()
export class FileSearcherServiceBackendImpl implements FileSearcherService {

    constructor(
        @inject(WorkspaceServer) protected readonly workspaceServer: WorkspaceServer,
        @inject(FileSystem) protected readonly fileSystem: FileSystem
    ) {
    }

    async search(fileName: string): Promise<string[]> {
        console.debug("Starting search of a file with the name: " + fileName);

        const rootUriAsString = await this.workspaceServer.getWorkspace();
        if (!rootUriAsString) {
            console.error("Can't resolve root URI");
            return [];
        }

        const fileStat = await this.fileSystem.getFileStat(rootUriAsString);
        if (!fileStat) {
            console.error("Can't get file stat for root URI");
            return [];
        }

        const uris: string[] = await this.searchSubtree(fileStat.uri, fileName);
        console.debug("Finishing search of a file with the name: " + fileName);
        console.debug("Search result: " + uris);

        return uris;
    }

    private async searchSubtree(uri: string, fileName: string): Promise<string[]> {
        console.debug("Searching subtree for URI: " + uri);

        const rootFileStat = await this.fileSystem.getFileStat(uri);

        if (rootFileStat!.isDirectory) {
            console.debug("Okay, it is a directory");

            const childrenFileStats = rootFileStat!.children;
            if (!childrenFileStats || childrenFileStats.length == 0) {
                console.debug("The directory is empty");
                return [];
            }

            console.debug("The directory has the following children");
            for (const childFileStat of childrenFileStats) {
                console.debug(childFileStat.uri);
            }

            let uris: string[] = [];
            for (const fileStat of childrenFileStats) {
                uris = uris.concat(await this.searchSubtree(fileStat.uri, fileName));
            }

            return uris;
        } else {
            console.debug("Okay, it is a file");
            const candidateUri = rootFileStat!.uri;

            if (candidateUri.endsWith(fileName)) {
                console.debug("There is a match: " + candidateUri);
                return [candidateUri];
            } else {
                return [];
            }
        }
    }
}



