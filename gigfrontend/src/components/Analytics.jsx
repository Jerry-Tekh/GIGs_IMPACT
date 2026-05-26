import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


import  styles from './Analytics.module.css';
import { formatReadableDate, formatShortChartDate } from '../utils/date.js';


const Analytics = () => {
  const [data, setData] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/analytics`,
        { credentials: 'include' }
      );

      const result = await res.json();

      setData(result.views);
      setTopPosts(result.topPosts);

    } catch (err) {
      console.error(err);
      setError('Unable to load analytics right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.analytics}>
      
      {/* Views Chart */}
      <div className={styles.chartBox}>
        <h3>Views Over Time</h3>
        {isLoading ? (
          <div className={styles.panelState}>
            <span className={styles.spinner} />
            <p>Loading traffic trends...</p>
          </div>
        ) : error ? (
          <div className={styles.panelState}>
            <p>{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="date" tickFormatter={formatShortChartDate} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatReadableDate(value)}
                formatter={(value) => [`${value} views`, 'Views']}
              />
              <Line type="monotone" dataKey="views" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Posts */}
      <div className={styles.topPosts}>
        <h3>Top Performing Posts</h3>

        {isLoading ? (
          <div className={styles.panelState}>
            <span className={styles.spinner} />
            <p>Loading top posts...</p>
          </div>
        ) : topPosts.length > 0 ? (
          topPosts.map((post, index) => (
            <div key={index} className={styles.topPostItem}>
              <div>
                <span className={styles.postTitle}>{post.title}</span>
                <small className={styles.postDate}>
                  {post.published_at ? formatReadableDate(post.published_at) : 'Publish date unavailable'}
                </small>
              </div>
              <strong>{post.views} views</strong>
            </div>
          ))
        ) : (
          <div className={styles.panelState}>
            <p>No post analytics available yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;
