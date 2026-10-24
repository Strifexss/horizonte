import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'HORIZONTE';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastContainer position="top-center" autoClose={5000} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();

/**
 * Radix trava o body com `pointer-events: none` enquanto há Dialog/Dropdown modal aberto e não o libera
 * quando duas camadas desmontam juntas (ex.: link dentro de menu dentro de modal), deixando a page seguinte sem clique.
 */
router.on('navigate', () => {
    document.body.style.removeProperty('pointer-events');
});
