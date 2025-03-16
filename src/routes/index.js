import Layout from '../components/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';
import SearchResults from '../pages/Search';
import NotificationTest from '../pages/NotificationTest';
import Post from '../pages/Post';
import Landing from '../pages/Landing';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from '../contexts/AuthContext';

const AuthLayout = () => (
  <AuthProvider>
    <Layout />
  </AuthProvider>
);

export const routes = [
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Landing />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: ':username',
        element: <Profile />,
      },
      {
        path: 'post/:postId',
        element: <Post />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
      {
        path: 'notifications/test',
        element: <PrivateRoute><NotificationTest /></PrivateRoute>,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
]; 