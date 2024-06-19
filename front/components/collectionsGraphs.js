import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import styles from "@/styles/CollectionsGraph.module.css";

export default function CollectionsGraph({ collection }) {
  return (
    <div className={styles.collectionsGraph}>
      <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
      <PieChart width={400} height={300} >
        <Pie
          dataKey="freq"
          isAnimationActive={false}
          data={collection}
          cx={180}
          cy={130}
          nameKey="token"
          outerRadius={60}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            index,
          }) => {
            const RADIAN = Math.PI / 180;
            // eslint-disable-next-line
            const radius = 25 + innerRadius + (outerRadius - innerRadius);
            // eslint-disable-next-line
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            // eslint-disable-next-line
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
              <text
                x={x}
                y={y}
                fill={collection[index].fill}
                fontWeight={600}
                fontSize={12}
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
              >
                {collection[index].token} (
                {Intl.NumberFormat("en", {
                  notation: "compact",
                }).format(value)}
                )
              </text>
            );
          }}
        />
        <Tooltip />
      </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
