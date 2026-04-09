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


const Analytics = () => {
  const [data, setData] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/analytics`,
        { credentials: 'include' }
      );

      const result = await res.json();

      setData(result.views);
      setTopPosts(result.topPosts);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.analytics}>
      
      {/* Views Chart */}
      <div className={styles.chartBox}>
        <h3>Views Over Time</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Posts */}
      <div className={styles.topPosts}>
        <h3>Top Performing Posts</h3>

        {topPosts.map((post, index) => (
          <div key={index} className={styles.topPostItem}>
            <span>{post.title}</span>
            <strong>{post.views} views</strong>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Analytics;