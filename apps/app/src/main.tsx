import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.tsx';
import { bootstrap } from './bootstrap.ts';
import { AppProvider } from './stores/app-context.tsx';
import './styles/app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Missing #root element in index.html');
}

const root = createRoot(rootElement);

bootstrap()
	.then((dependencies) =>
		root.render(
			<StrictMode>
				<AppProvider dependencies={dependencies}>
					<App />
				</AppProvider>
			</StrictMode>,
		),
	)
	.catch((error: unknown) => {
		console.error(error);
		root.render(<p role="alert">keyai could not start.</p>);
	});
