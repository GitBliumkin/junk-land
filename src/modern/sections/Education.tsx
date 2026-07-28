import styles from './Education.module.css';
import uottawaLogo from '../../assets/modern/images/u-ottawa-logo.png';
import contactImage from '../../assets/modern/images/contact-me.jpg';

// Both the heading and the logo are stencils cut into the same fixed photo
// backdrop (see their CSS: background-clip: text on the heading, a
// mask-image built from the logo's own artwork here) — background-position:
// fixed ties both to actual viewport coordinates, which is what makes them
// read as windows onto one continuous photo rather than two independently
// cropped images. That same photo is what ContactMe shows in full once this
// section's slide-away uncovers it underneath.
export default function Education() {
  return (
    <section id="education" className={styles.section}>
      <div className={styles.stage}>
        <div className={styles.content}>
          <h2 className={styles.heading} style={{ backgroundImage: `url(${contactImage})` }}>
            Education
          </h2>
          <div className={styles.details}>
            <div
              className={styles.logo}
              role="img"
              aria-label="University of Ottawa"
              style={{
                backgroundImage: `url(${contactImage})`,
                WebkitMaskImage: `url(${uottawaLogo})`,
                maskImage: `url(${uottawaLogo})`,
              }}
            />
            <h3 className={styles.school}>University of Ottawa</h3>
            <p className={styles.program}>Computer Engineering</p>
            <span className={styles.date}>2016 – 2020</span>
          </div>
        </div>
      </div>
    </section>
  );
}
