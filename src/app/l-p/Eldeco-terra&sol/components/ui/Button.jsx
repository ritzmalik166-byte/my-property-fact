import Icon from "./Icon";
import { icons } from "../../assets";
import styles from "./Button.module.css";

/**
 * The Figma "Button / *" component set.
 *   variant  primary  gold gradient, black label   (e.g. 23:255)
 *            outline  card fill, gold border        (e.g. 23:256)
 *            ghost    transparent, light border     (on dark: 23:208, 23:649)
 *   size     md 56px / 28px padding, sm 48px / 20px padding
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  arrow = false,
  full = false,
  href,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  const cls = ["ets-water", styles.btn, styles[variant], styles[size], full ? styles.full : "", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon ? <Icon src={icon} size={20} /> : null}
      <span className={styles.label}>{children}</span>
      {arrow ? <Icon src={icons.chevron} size={18} /> : null}
    </>
  );

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}
