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

export default function LangDocs({ langDocs }) {
  return (
    <div className={styles.langDocs}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={530}
          height={280}
          data={langDocs}
          margin={{
            top: 10,
            right: 0,
            left: 20,
            bottom: 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="perc"
            tickFormatter={percFormatter}
            label={{
              value: "Segments (Percentage)",
              angle: 0,
              position: "bottom",
              offset: 0,
              fontSize: 14,
            }}
          />
          <YAxis
            tickFormatter={DataFormatter}
            label={{
              value: "Documents",
              angle: -90,
              position: "insideLeft",
              offset: -8,
              fontSize: 14,
            }}
          />
          <Tooltip />
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
