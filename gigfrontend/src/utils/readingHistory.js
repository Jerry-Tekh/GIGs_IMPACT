const STORAGE_KEY = 'gigimpact_reading_history';

export const saveReadingHistory = (post) => {
  if (!post?.id) {
    return;
  }

  const existing = getReadingHistory();
  const nextEntry = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    category: post.category || 'General',
    read_time: post.read_time || 5,
    published_at: post.published_at || null,
    readAt: new Date().toISOString()
  };

  const nextHistory = [
    nextEntry,
    ...existing.filter((item) => item.id !== post.id)
  ].slice(0, 12);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
};

export const getReadingHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
