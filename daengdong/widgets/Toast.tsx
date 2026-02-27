"use client";

import styled from "@emotion/styled";
import { useToastStore } from "@/shared/stores/useToastStore";

export function Toast() {
    const { isOpen, options } = useToastStore();
    return (
        <>
            {isOpen && options && (
                <ToastContainer>
                    <ToastContent type={options.type || "info"}>
                        {options.message}
                    </ToastContent>
                </ToastContainer>
            )}
        </>
    );
}

const ToastContainer = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: max-content;
  max-width: calc(100% - 40px);
  animation: slideDownFade 0.3s ease-out forwards;

  @keyframes slideDownFade {
    0% {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
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
