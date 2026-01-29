"use client";

import styled from "@emotion/styled";
import { useToastStore } from "@/shared/stores/useToastStore";
import { AnimatePresence, motion } from "framer-motion";

export function Toast() {
    const { isOpen, options } = useToastStore();
    return (
        <AnimatePresence>
            {isOpen && options && (
                <ToastContainer
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    transition={{ duration: 0.3 }}
                >
                    <ToastContent type={options.type || "info"}>
                        {options.message}
                    </ToastContent>
                </ToastContainer>
            )}
        </AnimatePresence>
    );
}

const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 60px; /* Below header usually, or just top logic */
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: auto;
  max-width: 90%;
`;

const ToastContent = styled.div<{ type: "success" | "error" | "info" }>`
  padding: 12px 24px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ type }) => {
        switch (type) {
            case "success":
                return `
          background-color: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #C8E6C9;
        `;
            case "error":
                return `
          background-color: #FFEBEE;
          color: #C62828;
          border: 1px solid #FFCDD2;
        `;
            default:
                return `
          background-color: #333;
          color: white;
        `;
        }
    }}
`;
