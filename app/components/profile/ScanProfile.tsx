"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "./Card";
import { SectionTitle } from "./Card";

const QR_SIZE = 128;

export function ScanProfile({ webId }: { webId?: string | null }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!webId?.trim()) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(webId.trim(), { width: QR_SIZE, margin: 1 }).then(setDataUrl);
  }, [webId]);

  return (
    <Card>
      <SectionTitle>Scan my Profile</SectionTitle>
      <div className="flex flex-col items-center">
        <div
          className="flex h-40 w-40 shrink-0 items-center justify-center rounded border-2 border-gray-200 bg-gray-100 p-2"
          aria-hidden
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt=""
              width={QR_SIZE}
              height={QR_SIZE}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="grid h-full w-full grid-cols-10 grid-rows-10 gap-0.5">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    (i + Math.floor(i / 10)) % 2 === 0
                      ? "bg-gray-900"
                      : "bg-white"
                  }
                />
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-sm text-tranquil-black">
         View your profile
        </p>
      </div>
    </Card>
  );
}
