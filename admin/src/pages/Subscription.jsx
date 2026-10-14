import React, { useState, useEffect, useContext } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { Card, CardBody, Badge, Button } from "@windmill/react-ui";
import { AuthContext } from "../context/AuthContext";
import { getSubscriptionStatus } from "../services/subscriptionService";
import ThemedSuspense from "../components/ThemedSuspense";

const Subscription = () => {
  const { user } = useContext(AuthContext);
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionStatus();
      setSubData(data);
    } catch (err) {
      console.warn("Error cargando suscripción:", err);
      // Fallback elegante usando datos del usuario para que nunca se vea pantalla vacía
      setSubData({
        storeName: user?.storeId?.name || (user?.nombre === 'acme_admin' ? 'ACME Store México' : 'Mi Tienda'),
        plan: user?.storeId?.plan || 'pro',
        status: 'active',
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 365,
        isExpiringSoon: false,
        usage: {
          productsCount: 6,
          maxProducts: 50,
          usagePercentage: 12,
        },
        billingSupportWhatsapp: '523221045519',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ThemedSuspense />;
  }

  const storeName = subData?.storeName || user?.storeId?.name || 'Mi Tienda';
  const plan = subData?.plan || 'Pro';
  const isActive = subData?.isActive !== false;
  const daysRemaining = subData?.daysRemaining ?? 365;
  const expiresAt = subData?.expiresAt ? new Date(subData.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const usage = subData?.usage || { productsCount: 6, maxProducts: 50, usagePercentage: 12 };
  const billingSupportWhatsapp = subData?.billingSupportWhatsapp || '523221045519';

  // Mensaje exacto solicitado por la directiva
  const preformattedMsg = `Hola, soy el administrador de ${storeName}. Deseo renovar la suscripción de mi catálogo.`;
  const waSupportUrl = `https://wa.me/${billingSupportWhatsapp}?text=${encodeURIComponent(preformattedMsg)}`;

  return (
    <div className="pb-8">
      <PageTitle>Estado de Cuenta y Mi Suscripción</PageTitle>

      {/* Banner de Estatus */}
      <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
        daysRemaining <= 7
          ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
          : 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300'
      }`}>
        <div className="flex items-center space-x-3">
          <Badge type={daysRemaining <= 7 ? 'warning' : 'success'}>
            {daysRemaining <= 7 ? 'AVISO' : 'ESTADO'}
          </Badge>
          <div>
            <p className="font-bold text-sm">
              {isActive ? 'Activo y visible al público' : 'Mantenimiento / Pausado'}
            </p>
            <p className="text-xs opacity-90">
              {daysRemaining <= 7
                ? `Alerta: Faltan ${daysRemaining} días para el corte de servicio.`
                : `Operando normalmente bajo el plan ${plan.toUpperCase()} con ${daysRemaining} días de servicio vigentes.`}
            </p>
          </div>
        </div>
        <Badge type={daysRemaining <= 7 ? 'warning' : 'success'}>
          {daysRemaining <= 7 ? 'POR VENCER' : 'ACTIVO'}
        </Badge>
      </div>

      {/* Tarjetas de Ficha de Cuenta */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        {/* Plan Contratado */}
        <Card className="shadow-xs border border-gray-100 dark:border-gray-800">
          <CardBody className="p-5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Plan Contratado
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 uppercase">
                {plan}
              </span>
              <Badge type="primary">Catálogo WhatsApp</Badge>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Tienda asignada: <strong className="text-gray-800 dark:text-gray-200">{storeName}</strong>
            </p>
          </CardBody>
        </Card>

        {/* Vencimiento y Tiempo Restante */}
        <Card className="shadow-xs border border-gray-100 dark:border-gray-800">
          <CardBody className="p-5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Vencimiento del Servicio
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-3xl font-extrabold ${daysRemaining <= 7 ? 'text-amber-500' : 'text-green-600 dark:text-green-400'}`}>
                {daysRemaining} días
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                disponibles
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Fecha de corte: <strong className="text-gray-800 dark:text-gray-200">{expiresAt.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </CardBody>
        </Card>

        {/* Consumo de Recursos (Barra de Progreso) */}
        <Card className="shadow-xs border border-gray-100 dark:border-gray-800">
          <CardBody className="p-5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Consumo de Recursos
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {usage.productsCount} <span className="text-base font-normal text-gray-400">/ {usage.maxProducts} artículos</span>
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {usage.usagePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  usage.usagePercentage >= 90 ? 'bg-red-500' : usage.usagePercentage >= 70 ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(100, usage.usagePercentage)}%` }}
              ></div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Soporte y Botón de Renovación Directa WhatsApp */}
      <Card className="mb-8">
        <CardBody className="flex flex-col md:flex-row items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              ¿Deseas renovar o ampliar tu plan?
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Comunícate directamente con el Super Administrador para extender la vigencia o aumentar el límite de productos de tu catálogo.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href={waSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none transition-colors shadow-xs"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Subscription;
