/* prettier-ignore */
import {
createInertiaApp
} from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';

createServer((page) =>
    createInertiaApp({
        page,
        title: (title) => `${title} - ${import.meta.env.VITE_APP_NAME || 'HORIZONTE'}`,
        render: ReactDOMServer.renderToString,
        // Sob demanda: só a page renderizada é carregada, porque várias pages do sistema usam `window` ao serem importadas.
        resolve: (name) => import.meta.glob('./pages/**/*.tsx')[`./pages/${name}.tsx`](),
        // prettier-ignore
        setup: ({ App, props }) => <App {...props} />,
    }),
);
