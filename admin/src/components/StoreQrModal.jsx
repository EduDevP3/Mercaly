import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@windmill/react-ui";
import toast from "react-hot-toast";

function StoreQrModal({ isOpen, onClose, storeName, storeUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (isOpen && storeUrl) {
      QRCode.toDataURL(storeUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generando QR:", err));
    }
  }, [isOpen, storeUrl]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-catalogo-${(storeName || "tienda").toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Código QR descargado exitosamente");
  };

  const handleCopyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard
      .writeText(storeUrl)
      .then(() => toast.success("Enlace del catálogo copiado al portapapeles"))
      .catch(() => toast.error("No se pudo copiar el enlace"));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Código QR del Catálogo</ModalHeader>
      <ModalBody>
        <div className="flex flex-col items-center text-center py-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Escanea para acceder directamente al catálogo de{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {storeName || "tu tienda"}
            </span>
            . Listo para imprimir en manteles, mostradores o volantes.
          </p>

          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm inline-block mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR de ${storeName}`}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                Generando QR...
              </div>
            )}
          </div>

          <div className="w-full bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 break-all select-all mb-2">
            {storeUrl}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="flex justify-between sm:justify-end space-x-2">
        <Button layout="outline" onClick={handleCopyUrl} size="small">
          Copiar Enlace
        </Button>
        <Button onClick={handleDownloadQr} size="small">
          Descargar QR (PNG)
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default StoreQrModal;
