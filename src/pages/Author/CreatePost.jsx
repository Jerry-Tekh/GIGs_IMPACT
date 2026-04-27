import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Admin/Layout.jsx';
import { CreatePostModal } from '../Admin/CreatePost.jsx';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const CreatePost = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Layout user={user} title="Create Author Post" navItems={getNavigationForRole('author')}>
      <CreatePostModal role="author" onClose={() => navigate('/author/dashboard')} />
    </Layout>
  );
};

export default CreatePost;
