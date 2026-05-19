
import {getAdminStats,
         getViewsAnalytics,
          getTopPosts} 
          from './../models/AdminModel.js';


export const getAdminStatsController = async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//get analytics controller
export const getAnalyticsController = async (req, res) => {
  try {
    const views = await getViewsAnalytics();
    const topPosts = await getTopPosts();

    res.json({
      views,
      topPosts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
