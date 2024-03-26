import styles from "./../src/styles/NoiseDistributionGraph.module.css";
import React from "react";
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
import { percFormatter } from "../hooks/hooks";

export default function NoiseDistributionGraph({ noiseData }) {
  return (
    <div className={styles.noiseDistributionGraphContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          width={300}
          height={200}
          data={noiseData}
          margin={{
            top: 5,
            right: 30,
            left: 60,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" tickFormatter={percFormatter} />
          <YAxis dataKey="label" type="category" fontSize={12} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#D99002" name="% of corpus">
            {" "}
            <LabelList
              dataKey="perc"
              position="right"
              fontWeight={600}
              fill="#D99002"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
