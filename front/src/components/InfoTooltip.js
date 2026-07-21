"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import InfoCircle from "./InfoCircle";
import styles from "@/styles/InfoTooltip.module.css";

const TOOLTIP_MARGIN = 12;
const TOOLTIP_WIDTH = 360;

export default function InfoTooltip({
  children,
  className = "",
  triggerClassName = "",
  placement = "top",
}) {
  const tooltipId = useId();
  const closeTimer = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const show = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const hide = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const toggle = () => {
    clearCloseTimer();
    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, TOOLTIP_MARGIN + TOOLTIP_WIDTH / 2),
        viewportWidth - TOOLTIP_MARGIN - TOOLTIP_WIDTH / 2
      );

      setPosition({
        left,
        top: placement === "bottom"
          ? rect.bottom + TOOLTIP_MARGIN
          : rect.top - TOOLTIP_MARGIN,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, placement]);

  return (
    <span
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, triggerClassName].filter(Boolean).join(" ")}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={toggle}
      >
        <InfoCircle />
      </button>
      {open && position && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className={[styles.tooltip, styles[placement]].join(" ")}
          style={{
            left: position.left,
            top: position.top,
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {children}
        </span>,
        document.body
      )}
    </span>
  );
}
