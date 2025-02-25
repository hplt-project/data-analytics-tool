import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";
import styles from "@/styles/LanguagePieChart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipPie}>
        <p className={styles.pieLabel}>{`${payload[0].name}`}</p>
        {payload[0].payload.perc && (
          <p
            className={styles.perc}
          >{`% of total:   ${payload[0].payload.perc} %`}</p>
        )}
      </div>
    );
  }

  return null;
};

export default function LanguagePieChart({
  langs,
  total,
  warning,
  warningLang,
}) {
  let finalValues;
  if (langs.length > 10) {
    const others = langs.slice(10, langs.length);

    const othersLength = others.length;

    const final = others.reduce((a, b) => {
      return a + +b.freq;
    }, 0);

    finalValues = langs.toSpliced(10);

    finalValues.push({
      name: `${othersLength} Others - ${Intl.NumberFormat("en", {
        notation: "compact",
      }).format(final)}`,
      freq: final,
      perc: parseFloat((final * 100) / total).toFixed(2),
      fill: "gray",
      others: [...others],
    });
  } else {
    finalValues = langs;
  }
  return (
    <div className={styles.languagePieChartContainer}>
      {warning && (
        <p className={styles.warning}>
          {`*${warningLang} identification might be inaccurate because it is not
          supported by FastSpell`}
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
        <PieChart width={570} height={400}>
          <Pie
            dataKey="freq"
            isAnimationActive={false}
            data={finalValues}
            cx="40%"
            cy="40%"
            outerRadius="70%"
            strokeWidth={0.7}
          />
          <Legend
            layout="vertical"
            verticalAlign="top"
            align="right"
            formatter={(value, entry, index) => (
              <span className={styles.legendText}>{value}</span>
            )}
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
