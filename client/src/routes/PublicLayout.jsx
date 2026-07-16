import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050508', padding: '40px 20px' }}>
      
      {/* The Outlet is a window. React Router looks at App.jsx and 
        dynamically injects PublicJobBoard or AuthPage here depending on the URL!
      */}
      <Outlet />
      
    </div>
  );
}