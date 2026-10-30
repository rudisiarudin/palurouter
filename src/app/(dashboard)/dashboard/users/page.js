"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Wallet,
  Coins,
  Key,
  TrendingUp,
  Search,
  MoreVertical,
  Check,
  Trash2,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { Card, Button, Input, Modal, ConfirmModal } from "@/shared/components";
import { formatRupiah } from "@/shared/utils/currency";

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topUpUser, setTopUpUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("50000");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("client");
  const [newBalance, setNewBalance] = useState("10000");
  const [savingUser, setSavingUser] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        // Fallback to /api/users if admin endpoint returns error
        const resFallback = await fetch("/api/users");
        if (resFallback.ok) {
          const dataFallback = await resFallback.json();
          setUsers(dataFallback.users || []);
        }
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTopUp = async () => {
    if (!topUpUser || !topUpAmount || isNaN(parseFloat(topUpAmount))) return;
    setIsToppingUp(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          userId: topUpUser.id,
          amount: parseFloat(topUpAmount),
        }),
      });
      if (res.ok) {
        await fetchUsers();
        setTopUpUser(null);
        setTopUpAmount("50000");
      }
    } catch (e) {
      console.error("Top up error:", e);
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          role: newRole,
          balance: parseFloat(newBalance) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchUsers();
        setShowAddModal(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        setNewRole("client");
        setNewBalance("10000");
      } else {
        setFormError(data.error || "Gagal membuat user");
      }
    } catch (e) {
      setFormError("Terjadi kesalahan sistem");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/users?id=${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== confirmDelete.id));
        setConfirmDelete(null);
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalBalanceAll = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const totalSpentAll = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const clientsCount = users.filter((u) => u.role === "client").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-6 text-foreground" />
            Manajemen User & Klien
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola akun klien pembeli API, pantau pemakaian token, dan isi deposit saldo (Rupiah).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="size-4 mr-1.5" />
            Tambah Klien Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 text-muted-foreground">
            <span className="text-xs font-medium">Total Akun</span>
            <Users className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {users.length} <span className="text-xs font-normal text-muted-foreground">({clientsCount} Klien)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Terdaftar di sistem database</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 text-muted-foreground">
            <span className="text-xs font-medium">Total Saldo Beredar</span>
            <Wallet className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground truncate">
            {formatRupiah(totalBalanceAll)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Akumulasi deposit seluruh klien</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 text-muted-foreground">
            <span className="text-xs font-medium">Total Terpakai Klien</span>
            <TrendingUp className="size-4" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground truncate">
            {formatRupiah(totalSpentAll, { showDecimals: true })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Biaya token yang sudah terpotong</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 text-muted-foreground">
            <span className="text-xs font-medium">Sistem Keamanan</span>
            <Shield className="size-4 text-emerald-500" />
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground">
            Role-Based Access Control
          </div>
          <p className="text-xs text-muted-foreground mt-1">Data upstream terisolasi aman</p>
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="p-6 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Daftar Pengguna</h2>
            <p className="text-xs text-muted-foreground">Semua pengguna dengan akses ke dashboard atau API</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Users className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">Tidak ada pengguna ditemukan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {searchQuery ? `Hasil pencarian untuk "${searchQuery}" nihil.` : "Belum ada user yang terdaftar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-medium">
                  <th className="pb-3 px-3">Pengguna</th>
                  <th className="pb-3 px-3">Peran (Role)</th>
                  <th className="pb-3 px-3">Saldo Akun (Rp)</th>
                  <th className="pb-3 px-3">Kunci API</th>
                  <th className="pb-3 px-3">Total Terpakai</th>
                  <th className="pb-3 px-3">Terdaftar</th>
                  <th className="pb-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground border border-border">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                          <p className="text-muted-foreground text-[11px] truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground">
                          <Shield className="size-3" /> SUPER ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-foreground border border-border">
                          KLIEN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-foreground">
                      {user.role === "admin" ? (
                        <span className="text-muted-foreground text-[11px]">Tanpa Batas</span>
                      ) : (
                        <span className={user.balance <= 0 ? "text-red-400" : "text-emerald-400"}>
                          {formatRupiah(user.balance)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <Key className="size-3" />
                        {user.keysCount || 0} Key
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {formatRupiah(user.totalSpent || 0, { showDecimals: true })}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {user.role === "client" && (
                          <button
                            type="button"
                            onClick={() => {
                              setTopUpUser(user);
                              setTopUpAmount("50000");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 transition-all cursor-pointer"
                            title="Tambah deposit saldo klien"
                          >
                            <Coins className="size-3 text-muted-foreground" />
                            + Top Up
                          </button>
                        )}
                        {user.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(user)}
                            className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                            title="Hapus akun pengguna"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Top Up Saldo */}
      <Modal
        isOpen={!!topUpUser}
        title={`Top Up Deposit Saldo — ${topUpUser?.name || ""}`}
        onClose={() => setTopUpUser(null)}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Klien:</span>
              <span className="font-semibold text-foreground">{topUpUser?.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Saldo Saat Ini:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {formatRupiah(topUpUser?.balance || 0)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Pilihan Cepat (Preset)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(String(amt))}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                    topUpAmount === String(amt)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent text-foreground border-border"
                  }`}
                >
                  +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Jumlah Tambahan Saldo (Rp / IDR)"
            type="number"
            step="1000"
            min="1000"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="50000"
          />

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleTopUp}
              fullWidth
              disabled={isToppingUp || !topUpAmount || isNaN(parseFloat(topUpAmount)) || parseFloat(topUpAmount) <= 0}
            >
              {isToppingUp ? "Menambahkan Saldo..." : `Tambah ${formatRupiah(topUpAmount)} Saldo`}
            </Button>
            <Button onClick={() => setTopUpUser(null)} variant="ghost" fullWidth disabled={isToppingUp}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Tambah User Baru */}
      <Modal
        isOpen={showAddModal}
        title="Tambah Klien / User Baru"
        onClose={() => setShowAddModal(false)}
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5">
          <Input
            label="Nama Lengkap / Perusahaan"
            placeholder="e.g. Budi Santoso / Startup AI"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="budi@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Role (Hak Akses)</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="client">Klien (Consumer)</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>
            <Input
              label="Saldo Awal (Rp)"
              type="number"
              step="1000"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="10000"
            />
          </div>

          {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" fullWidth disabled={savingUser || !newEmail || !newPassword}>
              {savingUser ? "Menyimpan..." : "Buat Akun"}
            </Button>
            <Button onClick={() => setShowAddModal(false)} variant="ghost" fullWidth disabled={savingUser}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteUser}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${confirmDelete?.name} (${confirmDelete?.email})"? Semua API key milik pengguna ini juga akan terhapus.`}
        variant="danger"
        confirmText="Hapus Akun"
        cancelText="Batal"
      />
    </div>
  );
}
