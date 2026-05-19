import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import { CreatePostModal } from '../admin/CreatePost.jsx';
import { getNavigationForRole } from '../../config/navigation.js';

const CreatePost = ({ user, refreshUser }) => {
  const navigate = useNavigate();

  return (
    <Layout user={user} title="Create Author Post" navItems={getNavigationForRole('author')} refreshUser={refreshUser}>
      <CreatePostModal
        role="author"
        onClose={(result) => navigate('/author/dashboard', result?.message ? {
          state: {
            feedback: {
              message: result.message
            }
          }
        } : undefined)}
      />
    </Layout>
  );
};

export default CreatePost;
