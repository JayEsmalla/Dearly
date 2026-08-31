"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type ShareToolsProps = {
  url: string;
  recipientName: string;
  senderName: string;
  compact?: boolean;
};

export function ShareTools({ url, recipientName, senderName, compact = false }: ShareToolsProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [status, setStatus] = useState("");

  const absoluteUrl = () => new URL(url, window.location.origin).toString();
  const greeting = () => `${recipientName}, ${senderName} made a Dearly gift for you. Open it here: ${absoluteUrl()}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(new URL(url, window.location.origin).toString(), { width: 196, margin: 1, errorCorrectionLevel: "M" })
      .then((dataUrl) => { if (active) setQrDataUrl(dataUrl); })
      .catch(() => { if (active) setStatus("QR code could not be generated in this browser."); });
    return () => { active = false; };
  }, [url]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(absoluteUrl());
    setStatus("Gift link copied.");
  };

  const copyGreeting = async () => {
    await navigator.clipboard.writeText(greeting());
    setStatus("Greeting message copied.");
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      setStatus("Native sharing is not available here. Copy the link instead.");
      return;
    }
    try {
      await navigator.share({ title: `A Dearly gift for ${recipientName}`, text: `${senderName} made something for you.`, url: absoluteUrl() });
      setStatus("Share sheet opened.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("The share sheet could not be opened.");
    }
  };

  return (
    <div className={`share-toolkit${compact ? " share-toolkit--compact" : ""}`}>
      {qrDataUrl && <div className="share-qr"><Image unoptimized src={qrDataUrl} width={88} height={88} alt={`QR code for ${recipientName}'s Dearly gift`} /><small>Scan to open</small></div>}
      <div className="share-tool-actions">
        <button type="button" onClick={copyLink}>Copy link</button>
        <button type="button" onClick={nativeShare}>Share</button>
        <button type="button" onClick={copyGreeting}>Copy greeting</button>
      </div>
      {status && <p role="status" aria-live="polite">{status}</p>}
    </div>
  );
}
