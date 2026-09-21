import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { MessageSquare, Loader2, Send, Users, Hash, Plus, Search, Edit, Trash2, UserPlus, UserMinus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
}

interface ChannelMember {
  channel_id: string;
  user_id: string;
  joined_at: string;
  user?: { id: string; full_name: string | null; email: string; avatar_url: string | null };
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: { full_name: string | null; email: string; avatar_url: string | null };
}

const TeamChat = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isBackoffice } = usePermissions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [showEditChannel, setShowEditChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelDesc, setEditChannelDesc] = useState("");
  const [showManageMembers, setShowManageMembers] = useState<string | null>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [addUserSearch, setAddUserSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelSubRef = useRef<any>(null);

  const fetchChannels = async () => {
    const { data } = await supabase
      .from("chat_channels")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    if (data) {
      setChannels(data as Channel[]);
      if (!activeChannel && data.length > 0) {
        const defaultCh = data.find((c) => c.is_default) || data[0];
        setActiveChannel(defaultCh.id);
      }
    }
  };

  const fetchChannelMembers = async (channelId: string) => {
    const { data } = await supabase
      .from("chat_channel_members")
      .select(`
        *,
        user:profiles!chat_channel_members_user_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq("channel_id", channelId);
    if (data) setChannelMembers(data as ChannelMember[]);
  };

  const fetchAvailableUsers = async (channelId: string) => {
    const memberIds = channelMembers.map((m) => m.user_id);
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("active", true);
    if (memberIds.length > 0) {
      query = query.not("id", "in", `(${memberIds.join(",")})`);
    }
    const { data } = await query.order("full_name");
    if (data) setAvailableUsers(data as Profile[]);
  };

  const openManageMembers = async (channelId: string) => {
    setShowManageMembers(channelId);
    await fetchChannelMembers(channelId);
    await fetchAvailableUsers(channelId);
  };

  const addUserToChannel = async (channelId: string, userId: string) => {
    const { error } = await supabase
      .from("chat_channel_members")
      .insert({ channel_id: channelId, user_id: userId });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario agregado" });
      await fetchChannelMembers(channelId);
      await fetchAvailableUsers(channelId);
    }
  };

  const removeUserFromChannel = async (channelId: string, userId: string) => {
    const { error } = await supabase
      .from("chat_channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario removido" });
      await fetchChannelMembers(channelId);
      await fetchAvailableUsers(channelId);
    }
  };

  const fetchMessages = async (channelId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(full_name, email, avatar_url)
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as Message[]);
  };

  const handleEditChannel = async (channel: Channel) => {
    setShowEditChannel(channel);
    setEditChannelName(channel.name);
    setEditChannelDesc(channel.description || "");
  };

  const saveEditChannel = async (channelId: string) => {
    const { error } = await supabase
      .from("chat_channels")
      .update({
        name: editChannelName.trim(),
        description: editChannelDesc.trim() || null,
      })
      .eq("id", channelId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Canal actualizado" });
      setShowEditChannel(null);
      fetchChannels();
    }
  };

  const deleteChannel = async (channelId: string) => {
    if (!confirm("¿Eliminar este canal? Se borrarán todos sus mensajes.")) return;
    const { error } = await supabase.from("chat_channels").delete().eq("id", channelId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Canal eliminado" });
      if (activeChannel === channelId) setActiveChannel(null);
      fetchChannels();
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    fetchMessages(activeChannel);

    channelSubRef.current = supabase
      .channel(`chat:${activeChannel}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel_id=eq.${activeChannel}` },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from("profiles")
              .select("full_name, email, avatar_url")
              .eq("id", newMsg.sender_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages((prev) => [...prev, { ...newMsg, sender: data }]);
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      if (channelSubRef.current) {
        supabase.removeChannel(channelSubRef.current);
      }
    };
  }, [activeChannel, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || sending) return;

    setSending(true);
    const body = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("chat_messages").insert({
      channel_id: activeChannel,
      sender_id: user!.id,
      body,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setNewMessage(body);
    }
    setSending(false);
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    const { error } = await supabase.from("chat_channels").insert({
      name: newChannelName.trim(),
      description: newChannelDesc.trim() || null,
      created_by: user!.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Canal creado" });
      setShowCreateChannel(false);
      setNewChannelName("");
      setNewChannelDesc("");
      fetchChannels();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chat Equipo · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-14rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Chat de Equipo</h1>
            <p className="text-sm text-muted-foreground mt-1">Comunicación interna en tiempo real</p>
          </div>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo canal
          </button>
        </motion.div>

        <div className="flex-1 flex overflow-hidden glass-card rounded-2xl">
          {/* Sidebar channels */}
          <aside className="w-72 border-r border-foreground/[0.06] bg-card flex flex-col">
            <div className="p-4 border-b border-foreground/[0.06]">
              <h3 className="font-semibold text-foreground">Canales</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeChannel === ch.id
                      ? "bg-foreground/[0.06] text-foreground"
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {ch.is_default ? <Hash className="text-sigma-yellow" size={14} /> : <Hash className="text-foreground/30" size={14} />}
                    <span className="font-medium truncate">{ch.name}</span>
                  </div>
                  {ch.description && <p className="text-xs text-foreground/40 truncate mt-0.5">{ch.description}</p>}
                </button>
              ))}
            </div>
          </aside>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeChannel ? (
              <>
                <div className="p-4 border-b border-foreground/[0.06]">
                  <h3 className="font-semibold text-foreground">{channels.find((c) => c.id === activeChannel)?.name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender_id === user?.id ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                        {msg.sender?.avatar_url ? (
                          <img src={msg.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="text-foreground/40" size={16} />
                        )}
                      </div>
                      <div className={`max-w-[70%] ${msg.sender_id === user?.id ? "text-right" : ""}`}>
                        <div className={`glass-card rounded-2xl px-4 py-2 ${msg.sender_id === user?.id ? "bg-sigma-yellow/10" : ""}`}>
                          <p className="text-sm text-foreground/70">{msg.sender?.full_name || msg.sender?.email}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.body}</p>
                          <p className="text-xs text-foreground/40 mt-1 text-right">
                            {new Date(msg.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-foreground/[0.06]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-foreground/40">
                <p>Selecciona un canal para empezar a chatear</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showCreateChannel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateChannel(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-foreground/[0.08] rounded-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-foreground/[0.06]">
                  <h3 className="font-display text-lg font-semibold text-foreground">Nuevo canal</h3>
                </div>
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Nombre del canal"
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  />
                  <textarea
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                    rows={3}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateChannel(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateChannel}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditChannel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditChannel(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-foreground/[0.08] rounded-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-foreground/[0.06]">
                  <h3 className="font-display text-lg font-semibold text-foreground">Editar canal</h3>
                </div>
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    value={editChannelName}
                    onChange={(e) => setEditChannelName(e.target.value)}
                    placeholder="Nombre del canal"
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  />
                  <textarea
                    value={editChannelDesc}
                    onChange={(e) => setEditChannelDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                    rows={3}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowEditChannel(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEditChannel(showEditChannel.id)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showManageMembers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowManageMembers(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-foreground/[0.08] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-foreground/[0.06] flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Gestionar miembros</h3>
                  <button
                    onClick={() => setShowManageMembers(null)}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Users size={16} />
                      Miembros actuales ({channelMembers.length})
                    </h4>
                    {channelMembers.length === 0 ? (
                      <p className="text-sm text-foreground/40">No hay miembros en este canal</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {channelMembers.map((member) => (
                          <div key={member.user_id} className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center overflow-hidden">
                                {member.user?.avatar_url ? (
                                  <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="text-foreground/40" size={16} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{member.user?.full_name || member.user?.email}</p>
                                <p className="text-xs text-foreground/50">{member.user?.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeUserFromChannel(showManageMembers!, member.user_id)}
                              className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Eliminar del canal"
                            >
                              <UserMinus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-foreground/[0.06] pt-6">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <UserPlus size={16} />
                      Agregar miembros
                    </h4>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={addUserSearch}
                        onChange={(e) => setAddUserSearch(e.target.value)}
                        className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                      />
                    </div>
                    {availableUsers.length === 0 ? (
                      <p className="text-sm text-foreground/40 text-center py-4">No hay usuarios disponibles para agregar</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableUsers
                          .filter((u) =>
                            u.full_name?.toLowerCase().includes(addUserSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(addUserSearch.toLowerCase())
                          )
                          .map((u) => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center overflow-hidden">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Users className="text-foreground/40" size={16} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{u.full_name || u.email}</p>
                                  <p className="text-xs text-foreground/50">{u.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => addUserToChannel(showManageMembers!, u.id)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-sigma-yellow/20 text-sigma-yellow hover:bg-sigma-yellow/30 transition-colors"
                              >
                                Agregar
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamChat;