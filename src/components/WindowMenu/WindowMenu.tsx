import styles from "./WindowMenu.module.scss";

interface WindowMenuProps {
    menuItems?: string[];
    isMinified?: boolean;
}

const WindowMenu = ({ menuItems = [], isMinified = false }: WindowMenuProps) => {

    return (
        <section className={styles.windowMenu} data-minified={isMinified}>
            <div className={styles.menuInner}>
                <ul className={styles.menuList}>
                    {menuItems.map((item, index) => <li key={index} className={styles.menuItem}><button>{item}</button></li>)}
                </ul>
            </div>
        </section>
    );
};

export default WindowMenu;
