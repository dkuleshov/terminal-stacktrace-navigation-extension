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

import { ContainerModule } from 'inversify';
import { FileSearcherService, fileSearcherServicePath } from "../common/file-searcher-service";
import { FileSearcherServiceBackendImpl } from "./file-searcher-service-backend-impl";
import { JsonRpcConnectionHandler, ConnectionHandler } from "@theia/core/lib/common";

export default new ContainerModule(bind => {
    bind(FileSearcherService).to(FileSearcherServiceBackendImpl).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(fileSearcherServicePath, () =>
            ctx.container.get(FileSearcherService)
        )
    ).inSingletonScope();
});