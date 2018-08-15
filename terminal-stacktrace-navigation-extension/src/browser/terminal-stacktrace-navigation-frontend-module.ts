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

import { ContainerModule, Container } from "inversify";
import { TerminalWidget, TerminalWidgetOptions } from '@theia/terminal/lib/browser/base/terminal-widget';
import { TerminalStacktraceNavigationImpl } from './terminal-stacktrace-navigation-impl';
import { WebSocketConnectionProvider, WidgetFactory } from "@theia/core/lib/browser";
import { TERMINAL_WIDGET_FACTORY_ID } from "@theia/terminal/lib/browser/terminal-widget-impl";
import { FileSearcherService, fileSearcherServicePath } from "../common/file-searcher-service";

export default new ContainerModule((bind, unbind) => {
    bind(FileSearcherService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<FileSearcherService>(fileSearcherServicePath);
    }).inSingletonScope();

    unbind(TerminalWidget);
    bind(TerminalWidget).to(TerminalStacktraceNavigationImpl).inTransientScope();

    let terminalNum = 0;
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TERMINAL_WIDGET_FACTORY_ID,
        createWidget: (options: TerminalWidgetOptions) => {
            const child = new Container({ defaultScope: 'Singleton' });
            child.parent = ctx.container;
            const counter = terminalNum++;
            const domId = options.id || 'terminal-' + counter;
            const widgetOptions: TerminalWidgetOptions = {
                title: 'Terminal ' + counter,
                useServerTitle: true,
                destroyTermOnClose: true,
                ...options
            };
            child.bind(TerminalWidgetOptions).toConstantValue(widgetOptions);
            child.bind("terminal-dom-id").toConstantValue(domId);

            return child.get(TerminalWidget);
        }
    }));
});