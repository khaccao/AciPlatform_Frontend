import { AppRoutes } from './app/app.routes';
 import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="app-container">
      <AppRoutes />
      <ToastContainer />
    </div>
  );
}

export default App;
