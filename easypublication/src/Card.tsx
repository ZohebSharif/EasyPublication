import styles from './Card.module.css';

function Card() {
  return (
    <div className={styles.card}>
      <div className={styles.cardWrapper}>
        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.avatar}></div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Zoheb Sharif</div>
            <div className={styles.userRole}>Intern</div>
          </div>
        </div>

        {/* Image Section */}
        <div className={styles.imageSection}>
          {/* Placeholder for image */}
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <div className={styles.titleSection}>
                <div className={styles.title}>3D Data Visualization</div>
                <div className={styles.subtitle}>Interactive data exploration tool</div>
              </div>
              <div className={styles.description}>
                A comprehensive 3D visualization platform for exploring complex datasets. 
                This tool provides interactive features for data analysis and presentation, 
                making it easier to understand patterns and insights within your data.
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <div className={styles.tag}>
                <div className={styles.tagText}>View Project</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;