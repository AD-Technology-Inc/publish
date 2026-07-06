import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        fetch('http://gateway.localhost/health').then(response => {
            if (response.ok) {
                console.log('Gateway is healthy');
            } else {
                console.error('Gateway health check failed');
            }
        });
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
