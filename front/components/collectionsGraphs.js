import { PieChart, Pie, Tooltip } from "recharts";
import styles from "@/styles/CollectionsGraph.module.css";

export default function CollectionsGraph({ collection }) {
  return (
    <div className={styles.collectionsGrapg}>
      <PieChart width={1000} height={400}>
        <Pie
          dataKey="freq"
          isAnimationActive={false}
          data={collection}
          cx={200}
          cy={200}
          nameKey="token"
          outerRadius={80}
          label
        />
        <Tooltip />
      </PieChart>
    </div>
  );
}
