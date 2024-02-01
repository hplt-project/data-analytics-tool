import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./../src/styles/LanguagePieChart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipPie}>
        <p className={styles.pieLabel}>{`${payload[0].name}`}</p>
      </div>
    );
  }

  return null;
};

export default function LanguagePieChart({ langs }) {
  return (
    <div className={styles.languagePieChartContainer}>
      <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
        <PieChart width={570} height={400}>
          <Pie
            dataKey="perc"
            isAnimationActive={false}
            data={langs}
            cx={140}
            cy={140}
            outerRadius={120}
            strokeWidth={0.7}
          />
          <Legend
            margin={10}
            layout="vertical"
            verticalAlign="top"
            align="right"
            formatter={(value, entry, index) => (
              <span className={styles.legendText}>{value}</span>
            )}
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
