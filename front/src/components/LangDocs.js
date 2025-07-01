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
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";
import {
  DataFormatter,
  numberFormatter,
  percFormatter,
} from "@/lib/helpers";

import styles from "@/styles/LangDocs.module.css";

const CustomTooltip = ({ active, payload, label, srclang }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>{`${label}% of segments in ${srclang}`}</p>
        {payload.map((item, idx) => {
          return (
            <p
              key={idx}
              className={styles.desc}
              style={{ color: item.fill }}
            >{`Documents: ${item.payload[1].toLocaleString("en-US")} `}</p>
          );
        })}
      </div>
    );
  }

  return null;
};

function LangDocs({ langDocs, srclang, footNote }) {
  const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <div className={styles.langDocs}>
      <h3 className={styles.smaller}>
        Percentage of segments {srclang && `in ${srclang[0].label}`} inside
        documents{" "}
        <a className="lang-distribution-info-second">
          {" "}
          {!footNote && (
            <Info
              className={[styles.helpCircle, styles.desktopData].join(" ")}
              strokeWidth={2}
              color="#022831"
              width={18}
            />
          )}
        </a>
        <InfoTooltip
          anchorSelect=".lang-distribution-info-second"
          place="top"
          clickable
        >
          Language identification at segment-level based on Heliport: (
          <a
            href="https://github.com/ZJaume/heliport"
            target="_blank"
            className={styles.tooltipLink}
          >
            https://github.com/ZJaume/heliport
          </a>
          )
        </InfoTooltip>
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          height={300}
          data={langDocs}
          margin={{
            top: 32,
            right: 20,
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
              fontSize: 14,
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
              offset: 12,
              fontSize: 14,
            }}
            fontSize={12}
          />
          <Tooltip
            content={<CustomTooltip srclang={srclang} />}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey={(value) => value[1]} fill="#6d466b" maxBarSize={50}>
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
