import { createRoot } from 'react-dom/client';
import Gallery from '../app/gallery';
const root = document.getElementById('root');
if (root) createRoot(root).render(<Gallery/>);
