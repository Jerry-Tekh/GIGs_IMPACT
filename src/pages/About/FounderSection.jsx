import styles from './FounderSection.module.css';

const FounderSection = () => {
  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.container}>
        <div className={styles.contentCard}>
          <span className={styles.subtitle}>Founder&apos;s Journey</span>
          <h2 className={styles.name}>Founder&apos;s Story</h2>
          <p className={styles.description}>
            GIGs Impact Community was born from a deep personal journey. The founder grew up in Agric Quarters,
            Coal Camp, Enugu State, an environment where opportunities were limited and survival was the focus.
            But instead of becoming a limitation, that environment became a training ground.
          </p>
          <p className={styles.description}>
            Driven by the question "Why am I here?" he discovered one undeniable truth: the greatest tragedy is not
            poverty, but unused potential. He saw talented young people everywhere but no structure, no direction,
            and no platform to express their gifts. That burden led to creating GIGs Impact Community, a system
            designed to help people discover their purpose, activate their talents, and build meaningful lives.
          </p>
        </div>

        <aside className={styles.quotePanel}>
          <div className={styles.icon}>"</div>
          <p className={styles.quoteText}>
            You don&apos;t need everything to start. You just need to start with what you have.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default FounderSection;

