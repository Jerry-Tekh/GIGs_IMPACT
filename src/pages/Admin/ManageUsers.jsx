import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import styles from './ManagePost.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const ManageUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/api/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load registered users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setSavingUserId(userId);
    setError('');

    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Unable to update role');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <Layout user={user} title="Manage Users" navItems={getNavigationForRole('admin')}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.eyebrow}>Role Management</span>
            <h1>Assign admin, author, and reader access.</h1>
            <p>Every registered account appears here so admin can manage who reads, writes, or controls the platform.</p>
          </motion.div>
        </section>

        <section className={styles.contentSection}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {users.length > 0 ? (
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((member) => (
                      <tr key={member.id}>
                        <td className={styles.titleCell}>{member.full_name}</td>
                        <td>{member.email}</td>
                        <td className={styles.dateCell}>{new Date(member.created_at).toLocaleDateString()}</td>
                        <td>
                          <select
                            className={styles.categorySelect}
                            value={member.role}
                            disabled={savingUserId === member.id}
                            onChange={(event) => handleRoleChange(member.id, event.target.value)}
                          >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaUsers />
              <h3>No users found</h3>
              <p>Registered users will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ManageUsers;
