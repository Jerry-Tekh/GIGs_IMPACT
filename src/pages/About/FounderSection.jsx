import styles from './FounderSection.module.css';


import FounderImage from './../../assets/Founder.jpg';

const FounderSection = () => {
  return (
    <section className={styles.sectionWrapper}>
      {/* Decorative background bar */}
      <div className={styles.greyBackground}></div>

      <div className={styles.container}>
        {/* Left Side: Content Card */}
        <div className={styles.contentCard}>
          <span className={styles.subtitle}>Founder's Journey</span>
          <h2 className={styles.name}>Founder's Story</h2>
          <p className={styles.description}>
            GIGs Impact Community was born from a deep personal journey. The founder grew up in Agric Quarters, Coal Camp, Enugu State - an environment where opportunities were limited and survival was the focus. But instead of becoming a limitation, that environment became a training ground.
          </p>
          <p className={styles.description}>
            Driven by the question "Why am I here?" he discovered one undeniable truth: The greatest tragedy is not poverty, but unused potential. He saw talented young people everywhere but no structure, no direction, and no platform to express their gifts. That burden led to creating GIGs Impact Community - a system designed to help people discover their purpose, activate their talents, and build meaningful lives.
          </p>
        </div>

        {/* Right Side: Image and Quote */}
        <div className={styles.imageWrapper}>
          <img 
            src={FounderImage} 
            alt="Jason Mayo" 
            className={styles.founderImage} 
          />
          
          <div className={styles.quoteBox}>
            <div className={styles.icon}>�</div>
            <p className={styles.quoteText}>
              "You don't need everything to start. You just need to start with what you have."
            </p>
          </div>

          {/*<div className={styles.navigation}>
            <button className={styles.navBtn}>{'<'}</button>
            <button className={styles.navBtn}>{'>'}</button>
          </div>*/}
        </div>
      </div>
    </section>
  );
};

export default FounderSection;