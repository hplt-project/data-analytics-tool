import styles from "@/styles/Home.module.css";
import DataAnalyticsReport from "../../components/DataAnalyticsReport";

export default function Home({ doc }) {
  return (
    <>
      <div className={styles.viewerContainer}>
        {doc && <DataAnalyticsReport reportData={doc} />}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const yaml = require("js-yaml");
  const fs = require("fs");
  const path = require("path");

  const doc = yaml.load(
    fs.readFileSync(path.join(process.cwd(), "../yaml_dir/EN-ES.yaml"))
  );

  return {
    props: { doc },
  };
}
