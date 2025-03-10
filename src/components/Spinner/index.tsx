import { CSSProperties, FC } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";
import {ClipLoader} from "react-spinners";

type Props = {
  message?: string
};

const css: CSSProperties = {
  transform: "translate3d(0, 0, 0)",
  willChange: "transform"
}

export const Spinner: FC<Props> = () => {
  console.log('Spinner')
  return <div className={classNames(styles.spinner)}>
    <ClipLoader cssOverride={css} size={100} color={"#ffffffc8"}/>
  </div>
};
 
