import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import styles from "@/styles/DomainLabels.module.css";
import { DataFormatter, numberFormatter } from "@/lib/helpers";
import { Info } from "lucide-react";
import { Tooltip as InfoTooltip } from "react-tooltip";
import JSON5 from "json5";

function DomainLabels({ labels, footNote }) {
  if (typeof labels === "string") {
    labels = JSON5.parse(labels);
  }

  const entries = Object.entries(labels)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = entries.reduce((sum, { value }) => sum + value, 0) || 1;

  // Deterministic palette
  const palette = [
    "#5B8FF9", "#61DDAA", "#65789B", "#F6BD16", "#7262fd",
    "#78D3F8", "#9661BC", "#F6903D", "#008685", "#F08BB4",
    "#1E9493", "#D3F261", "#D62728", "#2CA02C", "#9467BD",
    "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF",
  ];
  const withColors = entries.map((item, idx) => ({
    ...item,
    fill: palette[idx % palette.length],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.label}>{label}</p>
          {payload.map((item, idx) => (
            <div style={{ marginTop: "4px", marginBottom: "4px" }} key={`domain-tooltip--${idx}`}>
              <p
                className={styles.desc}
                style={{ color: "#222222", display: "flex", alignItems: "center" }}
              >
                <div
                  style={{ height: "12px", width: "12px", backgroundColor: item.fill, marginRight: "4px" }}
                ></div>
                {`${numberFormatter(item.value)} (${((item.value / total) * 100).toFixed(1)}%)`}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    const firstColumn = payload.slice(0, Math.ceil(payload.length / 2));
    const secondColumn = payload.slice(Math.ceil(payload.length / 2));
    const LegendList = ({ items }) => (
      <ul className={styles.legendListStacked}>
        {items.map((entry, index) => (
          <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", color: "#1c1d2cff" }}>
            <div style={{ backgroundColor: entry.color, width: "12px", height: "12px", marginRight: "4px", borderRadius: "2px" }}></div>
            {`${entry.value} - ${((entry.payload.value / total) * 100).toFixed(1)}%`}
          </li>
        ))}
      </ul>
    );
    return (
      <div className={styles.labellist}>
        <div style={{ display: "flex" }}>
          <LegendList items={firstColumn} />
          <LegendList items={secondColumn} />
        </div>
      </div>
    );
  };

  return (
    <>
      {withColors && (
        <div className="custom-chart">
          <div className={styles.title}>
            <h2>Domain labels</h2>
            <a className="domain-labels-graph">
              {!footNote && (
                <Info className={[styles.helpCircle, styles.desktopData].join(" ")} strokeWidth={2} color="#022831" width={18} />
              )}
            </a>
            <InfoTooltip
              anchorSelect=".domain-labels-graph"
              place="top"
              clickable
              style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}
            >
              <p className={styles.tooltipText}>
                Obtained with{" "}
                <a className={styles.tooltipLink} href={"https://huggingface.co/nvidia/multilingual-domain-classifier"} target="_blank">
                  https://huggingface.co/nvidia/multilingual-domain-classifier
                </a>
              </p>
            </InfoTooltip>
          </div>
          <div className={styles["domain-labels"]}>
            <div className={styles["graph-cont"]}>
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <PieChart>
                  <Pie
                    data={withColors}
                    dataKey="value"
                    nameKey="name"
                    legendType="circle"
                    paddingAngle={1}
                    minAngle={1}
                    cx={"50%"}
                    outerRadius={115}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    width={40}
                    align="right"
                    formatter={(value, entry) => (
                      <span
                        className={styles.legendText}
                        style={{ marginBottom: "4px", marginTop: "4px", marginLeft: "5px", display: "inline-block", color: "#1e1f2cff" }}
                      >
                        {`${value} - ${((entry.payload.value / total) * 100).toFixed(1)}%`}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles["graph-cont-bars"]}>
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <BarChart
                  data={withColors}
                  margin={{ top: 42, right: 20, left: 10, bottom: 25 }}
                  legendType="circle"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={DataFormatter} label={{ value: "Documents", angle: 0, position: "top", offset: 22, fontSize: 14 }} />
                  <RechartsTooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />
                  <Bar dataKey="value">
                    {withColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DomainLabels;
