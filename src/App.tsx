import { useEffect } from 'react';
import { AppRoutes } from './app/app.routes';
 import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import { useAppSelector } from './app/hooks';

function App() {
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    const storageKeyTheme = user ? `theme_${user.username}` : 'theme';
    const storageKeyColor = user ? `primaryColor_${user.username}` : 'primaryColor';

    const savedTheme = localStorage.getItem(storageKeyTheme) || 'light';
    const savedColor = localStorage.getItem(storageKeyColor) || '#3FA9F5';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--primary-color', savedColor);
    document.documentElement.style.setProperty('--primary-light', `${savedColor}15`);
  }, [user]);

  return (
    <div className="app-container">
      <AppRoutes />
      <ToastContainer />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
