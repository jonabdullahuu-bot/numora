"use client";

import { useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

const PADDLE_ENV =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

export function usePaddleCheckout() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    if (!CLIENT_TOKEN) {
      console.error("Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
      return;
    }

    initializePaddle({
      environment: PADDLE_ENV,
      token: CLIENT_TOKEN,
    })
      .then((instance) => {
        if (instance) setPaddle(instance);
      })
      .catch((err) => {
        console.error("Paddle init failed:", err);
      });
  }, []);

  const openCheckout = (priceId: string) => {
    if (!paddle) {
      console.error("Paddle is not initialized yet");
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        theme: "dark",
      },
    });
  };

  return { openCheckout, isReady: Boolean(paddle) };
}
