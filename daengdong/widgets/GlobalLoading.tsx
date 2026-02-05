"use client";

import styled from "@emotion/styled";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PawPrintIcon from "@/shared/assets/icons/paw-print.svg";

export function LoadingView({ message }: { message?: string }) {
  const pawCount = 3;
  const paws = Array.from({ length: pawCount });

  return (
    <Overlay>
      <Container>
        <PawContainer>
          {paws.map((_, index) => (
            <PawWrapper
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
                times: [0, 0.2, 0.8]
              }}
            >
              <Image
                src={PawPrintIcon}
                alt="Loading paw"
                width={32}
                height={32}
                style={{ width: "100%", height: "100%" }}
              />
            </PawWrapper>
          ))}
        </PawContainer>
        {message && <Message>{message}</Message>}
      </Container>
    </Overlay>
  );
}

export function GlobalLoading() {
  const { isLoading, message } = useLoadingStore();

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return <LoadingView message={message || undefined} />;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); 
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999; 
  touch-action: none;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const PawContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 40px;
  align-items: center;
`;

const PawWrapper = styled(motion.div)`
  width: 32px;
  height: 32px;
  /* Rotate slightly for more natural look */
  &:nth-of-type(odd) {
    transform: rotate(-10deg);
  }
  &:nth-of-type(even) {
    transform: rotate(10deg);
  }
`;

const Message = styled.p`
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
