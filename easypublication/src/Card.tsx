import styles from './Card.module.css';

function Card() {
  return (
    <div className={styles.card}>
      <div className={styles.cardWrapper}>
        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userName}>Zoheb Sharif</div>
            <div className={styles.userRole}>Intern</div>
          </div>
        </div>

        {/* Image Section */}
        <div className={styles.imageSection}>

        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.contentWrapper}>
            <div className={styles.textContent}>
              <div className={styles.titleSection}>
                <div className={styles.title}>3D Data Visual</div>
                <div className={styles.subtitle}>A 3D visual on data</div>
              </div>
              <div className={styles.description}>
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Amet consectetur adipiscing elit quisque faucibus ex sapien. Quisque faucibus ex sapien vitae pellentesque sem placerat. Vitae pellentesque sem placerat in id cursus mi.
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <div className={styles.tag}>
                <div className={styles.tagText}>View</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;