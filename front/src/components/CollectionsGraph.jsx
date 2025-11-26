// components/CollectionsGraph.jsx
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { randDarkColor, numberFormatter } from "../lib/helpers";
import s from "@/styles/CollectionsGraph.module.css";
import { useState, useEffect, useMemo } from "react";
import Collections from "./Collections";

// Compact number formatter (k, M, B…)
const fmtCompact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

// Clean, non-scrolling tooltip (no overlay; just a tidy panel)
const CustomTooltip = ({ active, payload, totalValue }) => {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0];
  const name = p?.name ?? "";
  const value = p?.value ?? 0;
  const pct = totalValue > 0 ? ((value * 100) / totalValue).toFixed(2) : "0.00";
  const breakdown = p?.payload?.others ?? [];
  const showBreakdown = breakdown.length > 0 && name.includes("Others");

  const isCols4 = breakdown.length > 20;
  const tipClass = isCols4 ? s.tipWide : s.tip;
  const listClass = `${s.tipList} ${isCols4 ? s.cols4 : s.cols2}`;

  return (
    <div className={tipClass}>
      <div className={s.tipHead}>
        <span
          className={s.tipDot}
          style={{ background: p?.payload?.fill || "#888" }}
        />
        <span className={s.tipTitle}>{name}</span>
      </div>

      <div className={s.tipStats}>
        <span className={s.tipNum}>{fmtCompact.format(value)}</span>
        <span className={s.sep}>•</span>
        <span className={s.tipPct}>{pct}%</span>
      </div>

      {showBreakdown && (
        <>
          <div className={s.tipBreakTitle}>Breakdown</div>
          <div className={listClass}>
            {breakdown.map((o) => (
              <div key={o.token} className={s.tipItem}>
                <span className={s.token}>{o.token}</span>
                <span className={s.freq}>
                  <strong>{fmtCompact.format(o.freq)}</strong>
                  <span className={s.sep}>•</span>
                  {totalValue > 0
                    ? ((o.freq * 100) / totalValue).toFixed(2)
                    : "0.00"}
                  %
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function CollectionsGraph({ collection, docs, footNote }) {
  // keep your existing cooking logic intact
  const values = collection.reduce(
    (acc, item) => {
      const processedItem = {
        token: item[0],
        freq: item[1],
        fill: randDarkColor(),
      };
      acc.processedItems.push(processedItem);

      if (item[0].toLowerCase().includes("cc")) acc.ccTotal += item[1];
      else if (!item[0].toLowerCase().includes("unk")) acc.iaTotal += item[1];

      acc.totalValue += item[1];
      return acc;
    },
    { totalValue: 0, ccTotal: 0, iaTotal: 0, processedItems: [] }
  );

  const { totalValue, ccTotal, iaTotal, processedItems } = values;

  const others = processedItems.filter(
    (el) => parseFloat((el.freq * 100) / totalValue).toFixed(2) < 10
  );
  const othersCount = others.length;
  const othersTotal = others.reduce((sum, o) => sum + o.freq, 0);

  const newCollection = processedItems.filter(
    (el) => parseFloat((el.freq * 100) / totalValue).toFixed(2) > 10
  );
  if (others.length) {
    newCollection.push({
      token: `${othersCount} Others`,
      freq: othersTotal,
      fill: "gray",
      others: [...others],
    });
  }

  const ccPerc = (ccTotal / totalValue) * 100;
  const iaPerc = (iaTotal / totalValue) * 100;

  const [popup, setPopup] = useState(false);
  useEffect(() => {
    document.body.style.overflow = popup ? "hidden" : "unset";
  }, [popup]);

  // Stable memo to avoid needless rerenders
  const pieData = useMemo(() => newCollection, [totalValue, collection]);

  return (
    <div className={s.collectionsContainer}>
      <h3>{docs ? "Document collections" : "Collections"}</h3>

      <div className={s.title}>
        {!footNote && (
          <button className={s.popupBtn} onClick={() => setPopup((v) => !v)}>
            See details
          </button>
        )}
        {popup && (
          <Collections
            collections={newCollection}
            setPopup={setPopup}
            total={totalValue}
          />
        )}

        <div className={s.collectionsPercCont}>
          <p>CC = {ccPerc.toFixed(2)}%</p>
          <p>IA = {iaPerc.toFixed(2)}%</p>
        </div>
      </div>

      <div className={s.collectionsGraph}>
        <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
          <PieChart width={300} height={300}>
            <Pie
              dataKey="freq"
              nameKey="token"
              isAnimationActive={false}
              data={pieData}
              cx={200}
              cy={120}
              outerRadius={70}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                const RAD = Math.PI / 180;
                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                const x = cx + radius * Math.cos(-midAngle * RAD);
                const y = cy + radius * Math.sin(-midAngle * RAD);
                return (
                  <text
                    x={x}
                    y={y}
                    fill={pieData[index].fill}
                    fontWeight={600}
                    fontSize={12}
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                  >
                    {pieData[index].token} ({numberFormatter(value)})
                  </text>
                );
              }}
            />
            <Tooltip
              content={<CustomTooltip totalValue={totalValue} />}
              wrapperStyle={{ outline: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
