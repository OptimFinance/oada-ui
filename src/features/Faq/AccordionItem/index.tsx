import styles from "./index.module.scss";
import minusIcon from "../../../assets/icons/li_minus.svg";
import plusIcon from "../../../assets/icons/li_plus.svg";
import {ReactNode} from "react";
import classNames from "classnames";

interface Props {
  title: string;
  text: string;
  isActive: boolean;
  id: string;
  onItemClick: (id: string) => void;
  sectionCls?: string;
  itemCls?: string;
  children?: ReactNode;
}

const AccordionItem = ({ title, text, id, isActive, onItemClick, sectionCls, itemCls, children }: Props) => {
  const onHeaderClick = () => {
    if (isActive) {
      onItemClick("");
    } else {
      onItemClick(id);
    }
  };

  return (
    <section
      className={classNames(styles.accordionItem, sectionCls)}
      data-testid="accordion"
    >
      <div
        id={id}
        role="button"
        tabIndex={0}
        onClick={onHeaderClick}
        className={classNames(styles.accordionHeader, itemCls)}
      >
        <h2 className={styles.faqTitle}>{title}</h2>
        <span className={styles.button}>
          <img src={isActive ? minusIcon : plusIcon} alt="plus" />
        </span>
      </div>
      { isActive 
        ? children !== undefined
          ? <div className={styles.accordionBody}>{children}</div>
          : <div className={styles.accordionBody}>{text}</div>
        : <></>
      }
    </section>
  );
};

export default AccordionItem;
