import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Admin/Layout.jsx';
import { CreatePostModal } from '../Admin/CreatePost.jsx';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const CreatePost = ({ user, refreshUser }) => {
  const navigate = useNavigate();

  return (
    <Layout user={user} title="Create Author Post" navItems={getNavigationForRole('author')} refreshUser={refreshUser}>
      <CreatePostModal role="author" onClose={() => navigate('/author/dashboard')} />
    </Layout>
  );
};

export default CreatePost;
