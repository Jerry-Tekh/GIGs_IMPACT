import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUsers } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import styles from './ManagePosts.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole } from './../../config/navigation.js';
import { formatReadableDate } from './../../../utils/date.js';


const ManageUsers = ({ user, refreshUser }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      setError('');
      const data = await apiFetch('/api/users', { requireAuth: true });
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load registered users');
    } finally {
      setUsersLoading(false);
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
        requireAuth: true,
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

  const filteredUsers = users.filter((member) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      member.full_name?.toLowerCase().includes(normalizedQuery) ||
      member.email?.toLowerCase().includes(normalizedQuery);

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  return (
    <Layout user={user} title="Manage Users" navItems={getNavigationForRole('admin')} refreshUser={refreshUser}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.eyebrow}>Role Management</span>
            <h1>Assign admin, author, and reader access.</h1>
            <p>Manage every registered account to control who reads, writes, or controls the platform.</p>
          </motion.div>
        </section>

        <section className={styles.contentSection}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <select
                className={styles.categorySelect}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All roles</option>
                <option value="admin">Admins</option>
                <option value="author">Authors</option>
                <option value="reader">Readers</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className={styles.inlineSectionLoader}>
              <span className={styles.inlineSectionSpinner} aria-hidden="true" />
              <p>Checking for registered users to display...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
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
                    {filteredUsers.map((member) => (
                      <tr key={member.id}>
                        <td className={styles.titleCell}>{member.full_name}</td>
                        <td>{member.email}</td>
                        <td className={styles.dateCell}>{formatReadableDate(member.created_at)}</td>
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

              <div className={styles.mobileCardList}>
                {filteredUsers.map((member) => (
                  <details key={member.id} className={styles.mobileCard}>
                    <summary className={styles.mobileCardSummary}>
                      <div className={styles.mobileCardPrimary}>
                        <strong>{member.full_name}</strong>
                        <span>{member.email}</span>
                      </div>
                      <div className={styles.mobileCardMeta}>
                        <span className={styles.categoryBadge}>{member.role}</span>
                      </div>
                    </summary>

                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileDetailGrid}>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Email</span>
                          <strong className={styles.mobileValueWrap}>{member.email}</strong>
                        </div>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Joined</span>
                          <strong>{formatReadableDate(member.created_at)}</strong>
                        </div>
                      </div>

                      <div className={styles.mobileFieldBlock}>
                        <label className={styles.mobileFieldLabel} htmlFor={`role-${member.id}`}>Role</label>
                        <select
                          id={`role-${member.id}`}
                          className={styles.mobileSelect}
                          value={member.role}
                          disabled={savingUserId === member.id}
                          onChange={(event) => handleRoleChange(member.id, event.target.value)}
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaUsers />
              <h3>No users found</h3>
              <p>No users match the current search or role filter.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ManageUsers;
