import Link from 'next/link';
import styles from './auth.module.css';

function Brand({mobile=false}){return <Link className={`${styles.brand} ${mobile?styles.mobileBrand:''}`} href="/" aria-label="MOSAIQ dashboard"><span className={styles.mark} aria-hidden="true"><i/><i/><i/><i/></span>MOSAIQ</Link>}

export default function AuthShell({children,title='Make every marketing decision with confidence.',eyebrow='Marketing intelligence, clarified',description='MOSAIQ brings reporting, audience intelligence and media mix modelling into one clear view.'}){
 return <main className={styles.page}><aside className={styles.visual}><Brand/><div className={styles.pitch}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2><p>{description}</p></div><div className={styles.copyright}>© {new Date().getFullYear()} MOSAIQ. All rights reserved.</div></aside><section className={styles.content}><div className={styles.card}><Brand mobile/>{children}</div></section></main>
}
