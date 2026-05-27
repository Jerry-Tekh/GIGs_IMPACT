import { FaCheckCircle, FaFileAlt, FaHome, FaList, FaPlus, FaUsers, FaLayerGroup } from 'react-icons/fa';

export const getNavigationForRole = (role) => {
  switch (role) {
    case 'admin':
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
        { to: '/admin/createPost', label: 'Create Post', icon: FaPlus },
        { to: '/admin/posts', label: 'Manage Posts', icon: FaList },
        { to: '/admin/carousels', label: 'Manage Carousel', icon: FaLayerGroup },
        { to: '/admin/users', label: 'Manage Users', icon: FaUsers }
      ];
    case 'author':
      return [
        { to: '/author/dashboard', label: 'Dashboard', icon: FaHome },
        { to: '/author/createPost', label: 'Create Post', icon: FaPlus },
        { to: '/author/posts', label: 'My Posts', icon: FaFileAlt }
      ];
    case 'reader':
      return [
        { to: '/reader/dashboard', label: 'Dashboard', icon: FaHome },
      
        { to: '/reader/dashboard#reading-history', label: 'Reading History', icon: FaCheckCircle }
      ];
    default:
      return [];
  }
};
