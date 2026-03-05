import React, { useEffect, useRef, useState } from "react";

interface ModalProps {
  isVisible: boolean;
  onBackdropPress?: () => void;
  animationIn?: "slideInLeft" | "slideInUp" | "slideInRight" | "fadeIn";
  animationOut?: "slideOutLeft" | "slideOutDown" | "slideOutRight" | "fadeOut";
  children: React.ReactNode;
}

const Modal = ({
  isVisible,
  onBackdropPress,
  animationIn = "fadeIn",
  animationOut = "fadeOut",
  children,
}: ModalProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [animating, setAnimating] = useState<"in" | "out" | null>(null);

  useEffect(() => {
    if (isVisible) {
      setRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating("in"));
      });
      document.body.style.overflow = "hidden";
    } else if (rendered) {
      setAnimating("out");
      document.body.style.overflow = "";
      // Fallback: if transitionend doesn't fire, unmount after animation duration
      const timer = setTimeout(() => {
        setRendered(false);
        setAnimating(null);
      }, 400);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const isFade = animationIn === "fadeIn" || animationOut === "fadeOut";

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    // For slide animations, wait for transform; for fade, wait for opacity
    const relevantProp = isFade ? "opacity" : "transform";
    if (animating === "out" && e.propertyName === relevantProp) {
      setRendered(false);
      setAnimating(null);
    }
  };

  if (!rendered) return null;

  const isEntering = animating === "in";

  // Determine content transform based on animation type
  let contentStart = "translateX(-100%)";
  let contentEnd = "translateX(0)";
  if (animationIn === "slideInRight" || animationOut === "slideOutRight") {
    contentStart = "translateX(100%)";
    contentEnd = "translateX(0)";
  } else if (animationIn === "slideInUp") {
    contentStart = "translateY(100%)";
    contentEnd = "translateY(0)";
  } else if (animationIn === "fadeIn" || animationOut === "fadeOut") {
    contentStart = "none";
    contentEnd = "none";
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (
          (e.target === backdropRef.current || e.target === innerRef.current) &&
          onBackdropPress
        ) {
          onBackdropPress();
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isEntering ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        ref={innerRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          transform: isEntering ? contentEnd : contentStart,
          opacity: isFade ? (isEntering ? 1 : 0) : 1,
          transition: isFade
            ? "opacity 0.3s ease"
            : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
