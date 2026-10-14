import React, { useState, useContext, useEffect } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { AuthContext } from "../context/AuthContext";
import { Label, Input, Button, Card, CardBody, Badge } from "@windmill/react-ui";
import { Link } from "react-router-dom";
import apiClient from "../api";

// Colección curada de avatares de la API DiceBear en formato PNG (100% compatibles)
const DICEBEAR_PRESETS = [
  { name: "Alex (Personas)", url: "https://api.dicebear.com/7.x/personas/png?seed=Alex" },
  { name: "Luna (Personas)", url: "https://api.dicebear.com/7.x/personas/png?seed=Luna" },
  { name: "Felix (Lorelei)", url: "https://api.dicebear.com/7.x/lorelei/png?seed=Felix" },
  { name: "Midnight (Avataaars)", url: "https://api.dicebear.com/7.x/avataaars/png?seed=Midnight" },
  { name: "Cyber (Bottts)", url: "https://api.dicebear.com/7.x/bottts/png?seed=CyberTech" },
  { name: "Valeria (Micah)", url: "https://api.dicebear.com/7.x/micah/png?seed=Valeria" },
  { name: "Rider (Adventurer)", url: "https://api.dicebear.com/7.x/adventurer/png?seed=ShadowRider" },
  { name: "Sparkle (Thumbs)", url: "https://api.dicebear.com/7.x/thumbs/png?seed=Sparkle" },
];

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || DICEBEAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await apiClient.put("/auth/profile", {
        nombre,
        email,
        phone,
        bio,
        avatar,
      });

      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setMessage({ type: "success", text: "¡Perfil y avatar de DiceBear actualizados exitosamente!" });
      } else {
        setMessage({ type: "success", text: response.data.message || "Guardado exitosamente." });
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al guardar los cambios del perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (url) => {
    setAvatar(url);
    setMessage({ type: "success", text: "Avatar seleccionado. Haz clic en 'Guardar Cambios' para confirmarlo." });
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarUrl && customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl("");
      setMessage({ type: "success", text: "Avatar personalizado aplicado. Guarda los cambios para confirmar." });
    }
  };

  const handleGenerateRandomDiceBear = () => {
    const styles = ["personas", "lorelei", "avataaars", "bottts", "micah", "adventurer", "thumbs"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/png?seed=${randomSeed}`;
    setAvatar(newAvatarUrl);
    setMessage({ type: "success", text: "Nuevo avatar aleatorio generado. Guarda los cambios para confirmarlo." });
  };

  return (
    <div className="pb-8">
      <PageTitle>Administra tu Perfil</PageTitle>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 mb-8 md:grid-cols-3">
        {/* Tarjeta de Resumen y Selector DiceBear (1 columna) */}
        <Card className="h-fit shadow-xs">
          <CardBody className="flex flex-col items-center text-center p-6">
            <div className="relative mb-4">
              <img
                src={avatar}
                alt={nombre || "Avatar"}
                className="w-28 h-28 rounded-full object-cover bg-gray-100 dark:bg-gray-700 ring-4 ring-purple-600 dark:ring-purple-400 shadow-xl transition-all"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/personas/png?seed=${encodeURIComponent(nombre || 'admin')}`;
                }}
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full dark:border-gray-800" title="En línea"></span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {nombre || user?.nombre || "Administrador"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {email || "Sin correo registrado"}
            </p>

            <div className="mb-4">
              <Badge type="primary">
                {user?.role?.toUpperCase() || "ADMIN"}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-6">
              "{bio || "Administrador del catálogo."}"
            </p>

            {/* Selector de Avatares Rápidos de DiceBear */}
            <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Elige tu Avatar (DiceBear):
                </p>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">PNG 200 OK</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {DICEBEAR_PRESETS.map((preset, index) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      key={index}
                      type="button"
                      title={preset.name}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative w-12 h-12 mx-auto rounded-full overflow-hidden border-2 bg-gray-50 dark:bg-gray-700 transition-transform active:scale-95 ${
                        isSelected
                          ? "border-purple-600 ring-2 ring-purple-400 scale-110 shadow-md"
                          : "border-gray-200 dark:border-gray-600 opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <span className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botón Generador Aleatorio DiceBear */}
              <Button
                size="small"
                layout="outline"
                type="button"
                className="w-full text-xs font-bold mb-4"
                onClick={handleGenerateRandomDiceBear}
              >
                Generar Avatar Aleatorio
              </Button>

              {/* O pegar URL personalizada */}
              <div className="mt-2 text-left">
                <Label className="text-xs">
                  <span>O pega una URL de avatar personalizada:</span>
                  <div className="flex mt-1 space-x-2">
                    <Input
                      type="url"
                      placeholder="https://api.dicebear.com/..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <Button size="small" type="button" onClick={handleApplyCustomAvatar}>
                      Usar
                    </Button>
                  </div>
                </Label>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Formulario de Información Personal y de Cuenta (2 columnas) */}
        <div className="md:col-span-2">
          <Card className="shadow-xs">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Datos de la Cuenta de Administrador
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Modifica los datos personales y de contacto asociados a tu usuario en la base de datos.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <Label>
                    <span>Nombre de Usuario *</span>
                    <Input
                      className="mt-1"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      placeholder="admin"
                    />
                  </Label>

                  <Label>
                    <span>Correo Electrónico</span>
                    <Input
                      className="mt-1"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ejemplo.com"
                    />
                  </Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <Label>
                    <span>Teléfono de Contacto</span>
                    <Input
                      className="mt-1"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="523221045519"
                    />
                  </Label>

                  <Label>
                    <span>Rol en el Sistema</span>
                    <Input
                      className="mt-1 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      disabled
                      value={user?.role?.toUpperCase() || "ADMIN"}
                    />
                  </Label>
                </div>

                <Label className="mb-6">
                  <span>Biografía / Cargo Público</span>
                  <textarea
                    className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-textarea focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray rounded-md border-gray-300 p-2.5"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Escribe una breve descripción sobre tu rol en la tienda..."
                  ></textarea>
                </Label>

                <div className="flex justify-end space-x-3">
                  <Link to="/app/settings">
                    <Button layout="outline" size="regular">
                      Cambiar Contraseña
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading} size="regular">
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
