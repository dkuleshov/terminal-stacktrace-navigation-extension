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

export const fileSearcherServicePath = '/services/file-searcher';
export const FileSearcherService = Symbol("FileSearcherService");

/**
 * Simple service to search files by specific parameters
 */
export interface FileSearcherService {
    /**
     * Search file by file name. Returns URIs of all matching files.
     *
     * @param fileName - the name of a file
     */
    search(fileName: string): Promise<string[]>;
}