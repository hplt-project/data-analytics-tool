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
import useIsMobile from "@/lib/useIsMobile";

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
              {`${item.payload.docs.toLocaleString("en-US")} documents`}{" "}
              <span style={{ fontWeight: 600 }}>
                ({((item.payload.docs / total) * 100).toFixed(2)}%)
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
  const isMobile = useIsMobile();
  const numbers = isMobile ? [0, 25, 50, 75, 100] : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const chartData = langDocs.map(([ratio, docs]) => ({
    ratio,
    percentage: ratio * 100,
    docs,
  }));
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
        <p className={styles.statLine}>
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
          data={chartData}
          margin={{
            top: 32,
            right: isMobile ? 8 : 10,
            left: isMobile ? 0 : 10,
            bottom: isMobile ? 18 : 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="percentage"
            tickFormatter={percFormatter}
            label={{
              value: "Segments (Percentage)",
              angle: 0,
              position: "bottom",
              offset: 0,
              fontSize: isMobile ? 11 : 12,
            }}
            ticks={numbers}
            type="number"
            fontSize={isMobile ? 11 : 12}
            padding={{ left: isMobile ? 12 : 30, right: isMobile ? 12 : 30 }}
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
            fontSize={isMobile ? 11 : 12}
          />
          <Tooltip
            content={<CustomTooltip srclang={srclang} total={total} />}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="docs" fill="#582156ff" maxBarSize={50}>
            {!isMobile && (
              <LabelList
                dataKey={(value) => numberFormatter(value.docs)}
                fill="#6d466b"
                position="top"
                fontWeight={600}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LangDocs;
