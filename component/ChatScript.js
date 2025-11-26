// components/ChatScript.js
"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function ChatScript() {
  const [chatScript, setChatScript] = useState("");

  useEffect(() => {
    const fetchChatScript = async () => {
      try {
        const configRef = doc(db, "config", "chatScript");
        const configDoc = await getDoc(configRef);
        if (configDoc.exists()) {
          setChatScript(configDoc.data().script);
        }
      } catch (error) {
        console.error("Error loading chat script:", error);
      }
    };

    fetchChatScript();
  }, []);

  if (!chatScript) return null;

  return (
    <Script id="smartsupp-chat" strategy="afterInteractive">
      {chatScript}
    </Script>
  );
}
