import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { DataFormatter } from "../hooks/hooks";
import { percFormatter } from "../hooks/hooks";

import styles from "@/styles/LangDocs.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className={styles.tooltipOverlap}>
        <p className={styles.labelOverlap}>{label}</p>

        <p>
          {" "}
          Unique sentence frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[0].value)}
        </p>
        <p>
          {" "}
          Duplicate sentence frequency:{" "}
          {Intl.NumberFormat("en", {
            notation: "compact",
          }).format(payload[1].value)}
        </p>
      </div>
    );
  }
};

export default function LangDocs({ langDocs }) {
  return (
    <div className={styles.langDocs}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={langDocs}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="perc" tickFormatter={percFormatter} />
          <YAxis tickFormatter={DataFormatter} />
          <Tooltip />
          <Legend />
          <Bar dataKey="freq" fill="#6d466b">
            <LabelList
              dataKey="freqFormatted"
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
