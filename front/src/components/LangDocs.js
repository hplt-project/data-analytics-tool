import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { DataFormatter, numberFormatter, percFormatter } from "@/lib/helpers";

import styles from "@/styles/LangDocs.module.css";

const CustomTooltip = ({ active, payload, label, srclang, total }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p
          className={styles.label}
        >{`${label}% of segments in ${srclang[0].label}`}</p>
        {payload.map((item, idx) => {
          return (
            <p key={idx} className={styles.desc} style={{ color: item.fill }}>
              {`${item.payload[1].toLocaleString("en-US")} documents`}{" "}
              <span style={{ fontWeight: 600 }}>
                ({((item.payload[1] / total) * 100).toFixed(2)}%)
              </span>
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};

function LangDocs({ langDocs, srclang }) {
  const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const { total, totalUnderFifty, totalOverFifty } = langDocs.reduce(
    (acc, cur) => {
      acc.total += cur[1];

      if (cur[0] < 0.5) {
        acc.totalUnderFifty += cur[1];
      }
      if (cur[0] >= 0.5) {
        acc.totalOverFifty += cur[1];
      }
      return acc;
    },
    { total: 0, totalUnderFifty: 0, totalOverFifty: 0 }
  );
  const underFifty = ((totalUnderFifty / total) * 100).toFixed(2);
  const overFifty = ((totalOverFifty / total) * 100).toFixed(2);
  return (
    <div className={styles.langDocs}>
      <div className={styles.stats}>
        <p style={{ marginBottom: "6px" }}>
          segments {"<"} 50% - <span>{underFifty}% </span>(
          {numberFormatter(totalUnderFifty)} documents)
        </p>
        <p>
          segments {"≥"} 50% - <span>{overFifty}%</span> (
          {numberFormatter(totalOverFifty)} documents)
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={langDocs}
          margin={{
            top: 32,
            right: 10,
            left: 10,
            bottom: 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={(value) => value[0] * 100}
            tickFormatter={percFormatter}
            label={{
              value: "Segments (Percentage)",
              angle: 0,
              position: "bottom",
              offset: 0,
              fontSize: 12,
            }}
            ticks={numbers}
            type="number"
            fontSize={12}
            padding={{ left: 30, right: 30 }}
            allowDecimals
          />
          <YAxis
            tickFormatter={DataFormatter}
            label={{
              value: "Documents",
              angle: 0,
              position: "top",
              offset: 18,
              fontSize: 14,
            }}
            fontSize={12}
          />
          <Tooltip
            content={<CustomTooltip srclang={srclang} total={total} />}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey={(value) => value[1]} fill="#582156ff" maxBarSize={50}>
            <LabelList
              dataKey={(value) => numberFormatter(value[1])}
              fill="#6d466b"
              position="top"
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LangDocs;
