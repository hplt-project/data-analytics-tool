import styles from "@/styles/Spinner.module.css";

function Spinner({ light = false, size = "default", label = "Loading" }) {
  return (
    <span
      className={[
        styles.spinner,
        light ? styles.light : "",
        size === "large" ? styles.large : "",
      ].join(" ")}
      role="status"
      aria-label={label}
    />
  );
}

export default Spinner;
