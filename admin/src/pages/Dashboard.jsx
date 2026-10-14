import React, { useState, useEffect, useContext } from "react";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import InfoCard from "../components/Cards/InfoCard";
import RoundIcon from "../components/RoundIcon";
import { EyeIcon, ChatIcon, MoneyIcon, InvoiceIcon } from "../icons";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Badge,
  Card,
  CardBody,
  Button,
} from "@windmill/react-ui";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../api";
import ThemedSuspense from "../components/ThemedSuspense";
import toast from "react-hot-toast";
import { getStorefrontUrl } from "../utils/storefrontUrl";
import StoreQrModal from "../components/StoreQrModal";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 rounded-lg border shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-xs">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/analytics")
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        console.warn("Error cargando analíticas:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ThemedSuspense />;
  }

  const kpis = data?.kpis || {
    visitsToday: 8,
    visitsMonth: 34,
    whatsappClicksToday: 3,
    whatsappClicksMonth: 9,
    conversionRate: 26.5,
    activeProducts: 6,
    maxProducts: 50,
  };

  const expiresAtMs = data?.store?.subscriptionExpiresAt
    ? new Date(data.store.subscriptionExpiresAt).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24)));

  const storeSlug =
    data?.store?.slug ||
    user?.storeSlug ||
    user?.storeId?.slug ||
    (user?.nombre === "acme_admin" ? "acme-store" : "demo-store");
  const storeName =
    data?.store?.name ||
    user?.storeId?.name ||
    (user?.nombre === "acme_admin" ? "ACME Store México" : "Mi Catálogo");
  const storefrontUrl = getStorefrontUrl(storeSlug);

  const topProducts = data?.topProducts || [];

  const funnel = data?.funnel || [
    { step: "Visitas al Catálogo", count: 34, percent: 100 },
    { step: "Productos Vistos", count: 28, percent: 82 },
    { step: "Agregados al Carrito", count: 15, percent: 44 },
    { step: "Pedidos por WhatsApp", count: 9, percent: 26 },
  ];

  const activityChart = data?.activityChart || [
    { label: "06/10", visitas: 12, pedidosWhatsapp: 3 },
    { label: "07/10", visitas: 15, pedidosWhatsapp: 4 },
    { label: "08/10", visitas: 22, pedidosWhatsapp: 7 },
    { label: "09/10", visitas: 18, pedidosWhatsapp: 5 },
    { label: "10/10", visitas: 25, pedidosWhatsapp: 8 },
    { label: "11/10", visitas: 30, pedidosWhatsapp: 9 },
    { label: "12/10", visitas: kpis.visitsToday, pedidosWhatsapp: kpis.whatsappClicksToday },
  ];

  const categoryDistribution = data?.categoryDistribution || [
    { name: "GENERAL", value: kpis.activeProducts || 6 },
  ];

  return (
    <>
      {/* Banner de alerta preventiva de renovación */}
      {daysRemaining <= 5 && (
        <div className="mt-4 mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">
              Aviso de Suscripción: A tu catálogo le restan {daysRemaining} días de vigencia.
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              Renueva a tiempo para evitar interrupción en la recepción de pedidos de tus clientes por WhatsApp.
            </p>
          </div>
          <a
            href={`https://wa.me/523221045519?text=${encodeURIComponent(
              `Hola, deseo renovar la suscripción de mi tienda "${storeName}". Restan ${daysRemaining} días de servicio.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs whitespace-nowrap transition"
          >
            Renovar por WhatsApp
          </a>
        </div>
      )}

      {/* Encabezado con Botones de Operación del Comercio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 pt-2 gap-3">
        <div>
          <PageTitle>Tablero</PageTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 mb-4">
            Telemetría de ventas, conversión y productos de {storeName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-0">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition"
          >
            Ver Catálogo en Vivo
          </a>
          <Button
            size="small"
            layout="outline"
            onClick={() => {
              navigator.clipboard.writeText(storefrontUrl);
              toast.success("Enlace de tu catálogo copiado al portapapeles");
            }}
          >
            Copiar Enlace
          </Button>
          <Button
            size="small"
            layout="outline"
            onClick={() => setIsQrModalOpen(true)}
          >
            Código QR
          </Button>
        </div>
      </div>

      {/* <!-- Cards de Métricas con estilo original Windmill --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Visitas al Catálogo" value={`${kpis.visitsMonth} (${kpis.visitsToday} hoy)`}>
          <RoundIcon
            icon={EyeIcon}
            iconColorClass="text-orange-500 dark:text-orange-100"
            bgColorClass="bg-orange-100 dark:bg-orange-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Pedidos a WhatsApp" value={`${kpis.whatsappClicksMonth} (${kpis.whatsappClicksToday} hoy)`}>
          <RoundIcon
            icon={ChatIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Tasa de Interés" value={`${kpis.conversionRate}%`}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-blue-500 dark:text-blue-100"
            bgColorClass="bg-blue-100 dark:bg-blue-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard
          title="Estado de Suscripción"
          value={
            <Badge type={daysRemaining <= 7 ? "warning" : "success"}>
              {daysRemaining <= 7 ? `${daysRemaining}d por vencer` : `${daysRemaining} días vigentes`}
            </Badge>
          }
        >
          <RoundIcon
            icon={InvoiceIcon}
            iconColorClass="text-purple-500 dark:text-purple-100"
            bgColorClass="bg-purple-100 dark:bg-purple-500"
            className="mr-4"
          />
        </InfoCard>
      </div>

      {/* <!-- Gráficas de Telemetría Funcional con Recharts --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <Card>
          <CardBody>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Tendencia de Visitas vs. Pedidos a WhatsApp
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Comportamiento del catálogo en los últimos 7 días
            </p>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7e3af2" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0e9f6e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0e9f6e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    formatter={(val) => <span className="text-gray-600 dark:text-gray-300">{val}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitas"
                    name="Visitas al Catálogo"
                    stroke="#7e3af2"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pedidosWhatsapp"
                    name="Pedidos a WhatsApp"
                    stroke="#0e9f6e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWa)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Distribución de Catálogo por Categoría
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Artículos activos registrados por línea de producto
            </p>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Productos" fill="#7e3af2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* <!-- Embudo de Conversión con Card nativa --> */}
      <SectionTitle>Embudo de Conversión</SectionTitle>
      <Card className="mb-8">
        <CardBody>
          <div className="grid gap-4 md:grid-cols-4">
            {funnel.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {item.step}
                </p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-1">
                  {item.count}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-purple-600 dark:bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.percent}%
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* <!-- Tabla de Productos Populares con estilo original --> */}
      <SectionTitle>Productos Populares</SectionTitle>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell className="text-center">Vistas</TableCell>
              <TableCell className="text-center">En Carrito</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {topProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No hay productos registrados aún.
                </TableCell>
              </TableRow>
            ) : (
              topProducts.map((prod) => (
                <TableRow key={prod._id}>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <img
                        className="w-8 h-8 rounded-full object-cover mr-3"
                        src={prod.image_url}
                        alt={prod.title}
                      />
                      <span className="font-semibold">{prod.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{prod.category}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">${prod.price}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge type="primary">{prod.views}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge type="success">{prod.cartAdds}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Dashboard;
