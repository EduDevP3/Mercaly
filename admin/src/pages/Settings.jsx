import React, { useState } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { Label, Input, Button, Card, CardBody, Badge } from "@windmill/react-ui";
import apiClient from "../api";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estado del diagnóstico del backend
  const [pingStatus, setPingStatus] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setMessage({ type: "success", text: response.data.message });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setPingLoading(true);
    try {
      const response = await apiClient.get("/ping");
      setPingStatus(response.data);
    } catch (error) {
      setPingStatus({
        status: "error",
        database: "Error al conectar",
        message: error.message,
      });
    } finally {
      setPingLoading(false);
    }
  };

  return (
    <div>
      <PageTitle>Configuración del Sistema</PageTitle>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Panel 1: Seguridad de la Cuenta (Cambio de Contraseña) */}
        <Card>
          <CardBody className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Seguridad de la Cuenta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Actualiza tu contraseña administrativa periódicamente para proteger el panel.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <Label>
                <span>Contraseña Actual *</span>
                <Input
                  className="mt-1"
                  type="password"
                  placeholder="***************"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </Label>

              <Label className="mt-4">
                <span>Nueva Contraseña *</span>
                <Input
                  className="mt-1"
                  type="password"
                  placeholder="***************"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Label>

              <Label className="mt-4">
                <span>Confirmar Nueva Contraseña *</span>
                <Input
                  className="mt-1"
                  type="password"
                  placeholder="***************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Label>

              <div className="mt-6">
                <Button type="submit" disabled={loading} block>
                  {loading ? "Procesando..." : "Actualizar Contraseña"}
                </Button>
              </div>

              {message.text && (
                <div
                  className={`mt-4 p-3 rounded-md text-sm font-medium ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </CardBody>
        </Card>

        {/* Panel 2: Información del Negocio & Parámetros */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Parámetros del Negocio
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Información de configuración de la tienda y catálogo.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Tienda / Comercio:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {user?.storeId?.name || "Mi Tienda"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Canal de Pedidos:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    WhatsApp Conversacional
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Moneda de Venta:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    MXN ($ Pesos Mexicanos)
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 dark:text-gray-400">Catálogo Público:</span>
                  <Badge type="success">En Línea (Activo)</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Panel 3: Diagnóstico en Vivo de la Base de Datos & Backend */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Estado del Backend & MongoDB
                </h2>
                <Button size="small" layout="outline" onClick={handleTestConnection} disabled={pingLoading}>
                  {pingLoading ? "Verificando..." : "Probar Conexión"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Monitoreo en tiempo real del servidor y el clúster Atlas.
              </p>

              {pingStatus ? (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs space-y-1">
                  <p>
                    <span className="font-bold">Servidor API:</span>{" "}
                    <span className="text-green-600 dark:text-green-400 font-semibold">En Línea (200 OK)</span>
                  </p>
                  <p>
                    <span className="font-bold">Base de Datos:</span>{" "}
                    <span className={pingStatus.database === 'Connected' ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                      {pingStatus.database === 'Connected' ? "Conectada (MongoDB Atlas)" : "Desconectada"}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    <span className="font-bold text-gray-500 dark:text-gray-300">Última Comprobación:</span>{" "}
                    {new Date(pingStatus.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  Presiona "Probar Conexión" para verificar el estado de MongoDB Atlas en tiempo real.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
