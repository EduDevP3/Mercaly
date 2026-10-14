import React, { useState, useEffect, useContext } from "react";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import InfoCard from "../components/Cards/InfoCard";
import RoundIcon from "../components/RoundIcon";
import {
  StoreIcon,
  PeopleIcon,
  BellIcon,
  ChatIcon,
  EditIcon,
  EyeIcon,
  ForbiddenIcon,
  TablesIcon,
  OutlineCogIcon,
} from "../icons";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Select,
} from "@windmill/react-ui";
import {
  getSuperAdminMetrics,
  getSuperAdminStores,
  toggleStoreKillSwitch,
  updateStoreSubscription,
  updateStoreData,
  createStoreWithAdmin,
  getAtlasDatabases,
  provisionAtlasDatabase,
  impersonateStore,
} from "../services/subscriptionService";
import { AuthContext } from "../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import toast from "react-hot-toast";
import ThemedSuspense from "../components/ThemedSuspense";
import { getStorefrontUrl } from "../utils/storefrontUrl";
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

const SuperAdmin = () => {
  const { user, login } = useContext(AuthContext);
  const history = useHistory();
  const isSuperAdmin = user && (user.role === "super_admin" || user.role === "superadmin");

  const [activeTab, setActiveTab] = useState("tenants"); // 'tenants' | 'databases'
  const [metrics, setMetrics] = useState(null);
  const [stores, setStores] = useState([]);
  const [atlasData, setAtlasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros y Búsqueda en vivo de tiendas
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'expiring' | 'suspended'

  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  // Modal 1: Crear Tienda (con los campos exactos solicitados)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    slug: "",
    whatsappNumber: "",
    subscriptionExpiresAt: getDefaultDate(),
    adminEmail: "",
    adminPassword: "",
  });

  // Modal 2: Extender Suscripción
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedStoreForExtend, setSelectedStoreForExtend] = useState(null);
  const [extendDaysOption, setExtendDaysOption] = useState(30);
  const [extendLoading, setExtendLoading] = useState(false);

  // Modal 3: Editar Datos de Tienda
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStoreForEdit, setSelectedStoreForEdit] = useState(null);
  const [editStorePayload, setEditStorePayload] = useState({
    name: "",
    slug: "",
    whatsappNumber: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Aprovisionamiento BD Atlas
  const [provisionSlug, setProvisionSlug] = useState("");
  const [provisionLoading, setProvisionLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, s, atlas] = await Promise.all([
        getSuperAdminMetrics().catch((err) => {
          console.warn("Error cargando métricas:", err.message);
          return null;
        }),
        getSuperAdminStores().catch((err) => {
          console.warn("Error cargando tiendas:", err.message);
          return [];
        }),
        getAtlasDatabases().catch((err) => {
          console.warn("Error cargando bases de datos de Atlas:", err.message);
          return null;
        }),
      ]);
      setMetrics(m);
      setStores(s || []);
      setAtlasData(atlas);
    } catch (err) {
      setError(err.message || "Error al cargar datos del Super Admin");
      toast.error("Error al cargar datos del Super Admin");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKillSwitch = async (storeId, currentActive) => {
    try {
      await toggleStoreKillSwitch(storeId, !currentActive);
      setStores((prev) =>
        prev.map((st) =>
          st._id === storeId ? { ...st, isActive: !currentActive } : st
        )
      );
      toast.success(
        !currentActive
          ? "Tienda activada exitosamente"
          : "Tienda suspendida (Kill-Switch activado)"
      );
      const updatedMetrics = await getSuperAdminMetrics();
      setMetrics(updatedMetrics);
    } catch (err) {
      toast.error("Error al alternar Kill-Switch: " + err.message);
    }
  };

  const openExtendModal = (store) => {
    setSelectedStoreForExtend(store);
    setExtendDaysOption(30);
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtend = async (e) => {
    e.preventDefault();
    if (!selectedStoreForExtend) return;
    try {
      setExtendLoading(true);
      await updateStoreSubscription(selectedStoreForExtend._id, {
        extendDays: parseInt(extendDaysOption, 10),
      });
      toast.success(
        `Suscripción de ${selectedStoreForExtend.name} extendida +${extendDaysOption} días.`
      );
      setIsExtendModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Error al extender suscripción: " + err.message);
    } finally {
      setExtendLoading(false);
    }
  };

  const openEditModal = (store) => {
    setSelectedStoreForEdit(store);
    setEditStorePayload({
      name: store.name || "",
      slug: store.slug || "",
      whatsappNumber: store.whatsappNumber || "",
    });
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    if (!selectedStoreForEdit) return;
    try {
      setEditLoading(true);
      await updateStoreData(selectedStoreForEdit._id, editStorePayload);
      toast.success(`Datos de ${editStorePayload.name} actualizados.`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(
        "Error al actualizar tienda: " +
          (err.response?.data?.error?.message || err.message)
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await createStoreWithAdmin(newStore);
      setIsCreateModalOpen(false);
      setNewStore({
        name: "",
        slug: "",
        whatsappNumber: "",
        subscriptionExpiresAt: getDefaultDate(),
        adminEmail: "",
        adminPassword: "",
      });
      toast.success("Tienda y Administrador creados con éxito");
      loadData();
    } catch (err) {
      toast.error(
        "Error creando tienda: " +
          (err.response?.data?.error?.message || err.message)
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProvisionDatabase = async (e) => {
    e.preventDefault();
    if (!provisionSlug.trim()) return;

    try {
      setProvisionLoading(true);
      await provisionAtlasDatabase({
        slug: provisionSlug.toLowerCase().trim(),
        categories: [
          { name: "General", handle: "general", description: "Categoría inicial" },
        ],
      });
      setProvisionSlug("");
      toast.success("Base de datos y colecciones aprovisionadas en Atlas");
      const updatedAtlas = await getAtlasDatabases();
      setAtlasData(updatedAtlas);
    } catch (err) {
      toast.error(
        "Error aprovisionando base de datos: " +
          (err.response?.data?.error?.message || err.message)
      );
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleImpersonate = async (store) => {
    if (
      !window.confirm(
        `¿Deseas acceder y administrar la tienda "${store.name}"? Podrás regresar en cualquier momento cerrando sesión.`
      )
    ) {
      return;
    }
    try {
      const data = await impersonateStore(store._id);
      if (data?.token && data?.user) {
        if (login) {
          login(data.user, data.token);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success(`Sesión iniciada como administrador de ${store.name}`);
        history.push("/app/dashboard");
      }
    } catch (err) {
      toast.error(
        "Error al acceder como tienda: " +
          (err.response?.data?.error?.message || err.message)
      );
    }
  };

  const filteredStores = stores.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.slug && st.slug.toLowerCase().includes(q));
    if (!matchesQuery) return false;

    if (statusFilter === "active") return st.isActive && !st.isExpired;
    if (statusFilter === "expiring")
      return st.isActive && st.daysRemaining <= 7 && !st.isExpired;
    if (statusFilter === "suspended") return !st.isActive || st.isExpired;
    return true;
  });

  // 1. Acceso restringido si no es Super Admin
  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <PageTitle>Consola de Super Administrador</PageTitle>
        <Card className="max-w-xl mx-auto my-12 text-center p-8">
          <CardBody>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center">
              <ForbiddenIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Acceso Restringido
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Esta consola está reservada exclusivamente para el{" "}
              <strong>Super Administrador</strong> de la plataforma. Tu usuario
              actual ({user?.nombre || "admin"}) cuenta con el rol{" "}
              <strong>{user?.role || "store_admin"}</strong>.
            </p>
            <div className="mt-6">
              <Link to="/app/dashboard">
                <Button>Volver al Tablero de mi Tienda</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <ThemedSuspense />;
  }

  return (
    <div className="pb-8">
      {/* Encabezado con Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
        <div>
          <PageTitle>Super Admin</PageTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3 mb-4">
            Control de tiendas y plataforma
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-3 sm:mt-0">
          <Button onClick={() => setIsCreateModalOpen(true)} size="small">
            Nueva Tienda
          </Button>
          <Button onClick={loadData} layout="outline" size="small">
            Refrescar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition ${
            activeTab === "tenants"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Tiendas y Suscripciones ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab("databases")}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition ${
            activeTab === "databases"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Bases de Datos Atlas ({atlasData?.totalDatabases || 0})
        </button>
      </div>

      {/* PESTAÑA 1: GESTIÓN DE TIENDAS Y MÉTRICAS */}
      {activeTab === "tenants" && (
        <>
          {/* Métricas Globales (4 InfoCards Windmill) */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Tiendas Registradas"
              value={metrics?.totalStores || stores.length}
            >
              <RoundIcon
                icon={StoreIcon}
                iconColorClass="text-purple-600 dark:text-purple-100"
                bgColorClass="bg-purple-100 dark:bg-purple-600"
                className="mr-4"
              />
            </InfoCard>

            <InfoCard
              title="Activas vs Suspendidas"
              value={`${metrics?.activeStores || 0} / ${metrics?.suspendedStores || 0}`}
            >
              <RoundIcon
                icon={PeopleIcon}
                iconColorClass="text-green-600 dark:text-green-100"
                bgColorClass="bg-green-100 dark:bg-green-600"
                className="mr-4"
              />
            </InfoCard>

            <InfoCard
              title="Próximas a Vencer (≤ 7d)"
              value={metrics?.expiringSoonStores || 0}
            >
              <RoundIcon
                icon={BellIcon}
                iconColorClass="text-orange-500 dark:text-orange-100"
                bgColorClass="bg-orange-100 dark:bg-orange-500"
                className="mr-4"
              />
            </InfoCard>

            <InfoCard
              title="Clics WhatsApp (Mes)"
              value={metrics?.totalWhatsappClicksMonth || 0}
            >
              <RoundIcon
                icon={ChatIcon}
                iconColorClass="text-blue-500 dark:text-blue-100"
                bgColorClass="bg-blue-100 dark:bg-blue-500"
                className="mr-4"
              />
            </InfoCard>
          </div>

          {/* Gráficas de Telemetría Global con Recharts */}
          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <Card>
              <CardBody>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Tráfico Global y Clics a WhatsApp
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Actividad consolidada de todas las tiendas en los últimos 7 días
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metrics?.globalActivityChart || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorGlobalVisitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7e3af2" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorGlobalWa" x1="0" y1="0" x2="0" y2="1">
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
                        name="Visitas Totales"
                        stroke="#7e3af2"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorGlobalVisitas)"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicsWhatsapp"
                        name="Clics a WhatsApp"
                        stroke="#0e9f6e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorGlobalWa)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Distribución de Tiendas por Plan
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Suscripciones activas agrupadas por nivel contratado
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        metrics?.planDistribution && metrics.planDistribution.length > 0
                          ? metrics.planDistribution
                          : [
                              { name: "FREE", count: stores.filter((s) => (s.subscriptionPlan || "free").toLowerCase() === "free").length },
                              { name: "BASIC", count: stores.filter((s) => s.subscriptionPlan === "basic").length },
                              { name: "PRO", count: stores.filter((s) => s.subscriptionPlan === "pro").length },
                              { name: "ENTERPRISE", count: stores.filter((s) => s.subscriptionPlan === "enterprise").length },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Cantidad de Tiendas"
                        fill="#7e3af2"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Barra de Filtros y Búsqueda en vivo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
            <SectionTitle>Gestión de Tiendas</SectionTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                placeholder="Buscar por nombre o slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 text-xs"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs"
              >
                <option value="all">Todas ({stores.length})</option>
                <option value="active">Activas</option>
                <option value="expiring">Por vencer (≤ 7d)</option>
                <option value="suspended">Suspendidas / Vencidas</option>
              </Select>
            </div>
          </div>

          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Tienda</TableCell>
                  <TableCell>Contacto WhatsApp</TableCell>
                  <TableCell>Plan y Vencimiento</TableCell>
                  <TableCell>Kill-Switch (Estado)</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "No se encontraron tiendas con los filtros aplicados."
                        : "No hay tiendas registradas aún. Haz clic en 'Nueva Tienda' para registrar la primera."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((st) => {
                    const expiresDate = st.subscriptionExpiresAt
                      ? new Date(st.subscriptionExpiresAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Sin fecha";
                    const daysRemaining = st.daysRemaining || 0;

                    // Estado dinámico del badge
                    let badgeType = "success";
                    let badgeLabel = "Activo";

                    if (!st.isActive) {
                      badgeType = "danger";
                      badgeLabel = "Suspendido";
                    } else if (st.isExpired || daysRemaining <= 0) {
                      badgeType = "danger";
                      badgeLabel = "Vencido";
                    } else if (daysRemaining <= 7) {
                      badgeType = "warning";
                      badgeLabel = "Por vencer";
                    }

                    return (
                      <TableRow key={st._id}>
                        {/* Tienda: Nombre y slug */}
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {st.name}
                            </p>
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                              /{st.slug}
                            </span>
                          </div>
                        </TableCell>

                        {/* Contacto: WhatsApp */}
                        <TableCell>
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {st.whatsappNumber || "Sin teléfono"}
                          </span>
                        </TableCell>

                        {/* Plan y Vencimiento */}
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                                {st.subscriptionPlan || "free"}
                              </span>
                              <Badge type={badgeType}>{badgeLabel}</Badge>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Corte: {expiresDate} ({daysRemaining}d restantes)
                            </span>
                          </div>
                        </TableCell>

                        {/* Kill-Switch interactivo */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={st.isActive}
                              onClick={() => handleToggleKillSwitch(st._id, st.isActive)}
                              className={`${
                                st.isActive ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                            >
                              <span
                                className={`${
                                  st.isActive ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                              />
                            </button>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {st.isActive ? "Operativa" : "Bloqueada"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* 1. Ver Catálogo en vivo */}
                            <a
                              href={getStorefrontUrl(st.slug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-gray-700 transition"
                              title="Abrir Catálogo en Vivo"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </a>

                            {/* 2. Cobranza directa por WhatsApp */}
                            <a
                              href={`https://wa.me/${st.whatsappNumber}?text=${encodeURIComponent(
                                `Hola, te contactamos de la administración. La suscripción de tu catálogo "${st.name}" tiene ${daysRemaining} días de vigencia. Te compartimos los datos para renovar y mantener tus pedidos activos.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-gray-700 transition"
                              title="Enviar Recordatorio por WhatsApp"
                            >
                              <ChatIcon className="w-4 h-4" />
                            </a>

                            {/* 3. Acceder como tienda (Impersonate) */}
                            <button
                              type="button"
                              onClick={() => handleImpersonate(st)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition"
                              title="Acceder como Administrador de la Tienda"
                            >
                              <StoreIcon className="w-4 h-4" />
                            </button>

                            {/* 4. Extender días */}
                            <Button
                              size="small"
                              layout="outline"
                              onClick={() => openExtendModal(st)}
                            >
                              Extender
                            </Button>

                            {/* 5. Editar datos */}
                            <Button
                              size="small"
                              layout="link"
                              aria-label="Editar Datos"
                              onClick={() => openEditModal(st)}
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* PESTAÑA 2: BASES DE DATOS EN MONGODB ATLAS */}
      {activeTab === "databases" && (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Aprovisionar Base de Datos en MongoDB Atlas
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Crea el namespace aislado para una tienda con sus colecciones correspondientes en Atlas.
              </p>
              <form
                onSubmit={handleProvisionDatabase}
                className="mt-4 flex flex-col sm:flex-row gap-3"
              >
                <Input
                  placeholder="ej: zapateria-guadalajara"
                  className="font-mono text-sm"
                  value={provisionSlug}
                  onChange={(e) => setProvisionSlug(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  disabled={provisionLoading}
                  className="whitespace-nowrap font-bold"
                >
                  {provisionLoading ? "Aprovisionando..." : "Crear BD en Atlas"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {atlasData?.databases?.map((db) => (
              <Card key={db.dbName} className="shadow-xs">
                <CardBody>
                  <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                        MongoDB Atlas DB
                      </span>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-mono">
                        {db.dbName}
                      </h4>
                    </div>
                    <Badge type="neutral">
                      {(db.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">
                      Colecciones Físicas ({db.collectionsCount}):
                    </p>
                    <div className="space-y-1.5">
                      {db.collections.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                        >
                          <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                            <TablesIcon className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                            {col.name}
                          </span>
                          <span className="text-purple-600 dark:text-purple-300 font-bold">
                            {col.documentCount} docs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREAR NUEVA TIENDA */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>Crear Nueva Tienda & Administrador</ModalHeader>
        <ModalBody>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div>
              <Label>Nombre de la Tienda *</Label>
              <Input
                className="mt-1"
                placeholder="Ej. Boutique Roma"
                value={newStore.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = val
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  setNewStore((prev) => ({
                    ...prev,
                    name: val,
                    slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                      ? autoSlug
                      : prev.slug,
                  }));
                }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug de URL *</Label>
                <Input
                  className="mt-1 font-mono"
                  placeholder="boutique-roma"
                  value={newStore.slug}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      slug: e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Teléfono de WhatsApp *</Label>
                <Input
                  className="mt-1 font-mono"
                  placeholder="5213111234567"
                  value={newStore.whatsappNumber}
                  onChange={(e) =>
                    setNewStore({ ...newStore, whatsappNumber: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label>Fecha de Vencimiento Inicial *</Label>
              <Input
                type="date"
                className="mt-1"
                value={newStore.subscriptionExpiresAt}
                onChange={(e) =>
                  setNewStore({ ...newStore, subscriptionExpiresAt: e.target.value })
                }
                required
              />
            </div>

            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
              Credenciales del Store Admin Inicial
            </p>

            <div>
              <Label>Correo del Store Admin *</Label>
              <Input
                type="email"
                className="mt-1"
                placeholder="admin@roma.com"
                value={newStore.adminEmail}
                onChange={(e) =>
                  setNewStore({ ...newStore, adminEmail: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Contraseña Inicial *</Label>
              <Input
                type="password"
                className="mt-1"
                placeholder="Contraseña segura"
                value={newStore.adminPassword}
                onChange={(e) =>
                  setNewStore({ ...newStore, adminPassword: e.target.value })
                }
                required
              />
            </div>

            <ModalFooter>
              <div className="hidden sm:block">
                <Button layout="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
              <div className="hidden sm:block">
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Creando..." : "Crear Tienda"}
                </Button>
              </div>
              <div className="block w-full sm:hidden">
                <Button
                  block
                  size="large"
                  layout="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
              <div className="block w-full sm:hidden">
                <Button block size="large" type="submit" disabled={createLoading}>
                  {createLoading ? "Creando..." : "Crear Tienda"}
                </Button>
              </div>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* MODAL 2: EXTENDER SUSCRIPCIÓN */}
      <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)}>
        <ModalHeader>Extender Suscripción</ModalHeader>
        <ModalBody>
          {selectedStoreForExtend && (
            <form onSubmit={handleConfirmExtend} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Extiende la vigencia para la tienda{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {selectedStoreForExtend.name}
                </strong>
                . Días vigentes actuales:{" "}
                <strong className="text-purple-600 dark:text-purple-400">
                  {selectedStoreForExtend.daysRemaining} días
                </strong>
                .
              </p>

              <div>
                <Label>Selecciona el periodo a sumar:</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[15, 30, 90].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      size="small"
                      layout={extendDaysOption === days ? "primary" : "outline"}
                      onClick={() => setExtendDaysOption(days)}
                    >
                      +{days} días
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>O especifica cantidad manual de días:</Label>
                <Input
                  type="number"
                  className="mt-1"
                  min="1"
                  value={extendDaysOption}
                  onChange={(e) => setExtendDaysOption(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <ModalFooter>
                <div className="hidden sm:block">
                  <Button
                    layout="outline"
                    onClick={() => setIsExtendModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="hidden sm:block">
                  <Button type="submit" disabled={extendLoading}>
                    {extendLoading ? "Aplicando..." : "Confirmar Extensión"}
                  </Button>
                </div>
                <div className="block w-full sm:hidden">
                  <Button
                    block
                    size="large"
                    layout="outline"
                    onClick={() => setIsExtendModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="block w-full sm:hidden">
                  <Button block size="large" type="submit" disabled={extendLoading}>
                    {extendLoading ? "Aplicando..." : "Confirmar Extensión"}
                  </Button>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalBody>
      </Modal>

      {/* MODAL 3: EDITAR DATOS DE LA TIENDA */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader>Editar Datos de la Tienda</ModalHeader>
        <ModalBody>
          {selectedStoreForEdit && (
            <form onSubmit={handleConfirmEdit} className="space-y-4">
              <div>
                <Label>Nombre de la Tienda *</Label>
                <Input
                  className="mt-1"
                  value={editStorePayload.name}
                  onChange={(e) =>
                    setEditStorePayload({
                      ...editStorePayload,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label>Slug de URL *</Label>
                <Input
                  className="mt-1 font-mono"
                  value={editStorePayload.slug}
                  onChange={(e) =>
                    setEditStorePayload({
                      ...editStorePayload,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label>Teléfono de WhatsApp *</Label>
                <Input
                  className="mt-1 font-mono"
                  value={editStorePayload.whatsappNumber}
                  onChange={(e) =>
                    setEditStorePayload({
                      ...editStorePayload,
                      whatsappNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <ModalFooter>
                <div className="hidden sm:block">
                  <Button layout="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                </div>
                <div className="hidden sm:block">
                  <Button type="submit" disabled={editLoading}>
                    {editLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
                <div className="block w-full sm:hidden">
                  <Button
                    block
                    size="large"
                    layout="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="block w-full sm:hidden">
                  <Button block size="large" type="submit" disabled={editLoading}>
                    {editLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SuperAdmin;
