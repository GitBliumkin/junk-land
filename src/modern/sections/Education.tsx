import styles from './Education.module.css';
import uottawaLogo from '../../assets/modern/images/u-ottawa-logo.png';

export default function Education() {
  return (
    <section className={styles.section}>
      <div className={styles.stage}>
        <div className={styles.content}>
          <h2 className={styles.heading}>Education</h2>
          <div className={styles.details}>
            <img src={uottawaLogo} alt="University of Ottawa" className={styles.logo} draggable={false} />
            <h3 className={styles.school}>University of Ottawa</h3>
            <p className={styles.program}>Computer Engineering</p>
            <span className={styles.date}>2016 – 2020</span>
          </div>
        </div>
      </div>
    </section>
  );
}
