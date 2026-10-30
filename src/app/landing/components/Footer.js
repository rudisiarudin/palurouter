"use client";
import { LogoIcon } from "@/shared/components";

export default function Footer() {
  return (
    <footer className="border-t border-teal-900/30 bg-[#0a1211] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <LogoIcon className="h-7 w-7 text-teal-400" />
              <h3 className="text-white text-lg font-bold">PALU Router</h3>
            </div>
            <p className="text-gray-400 text-sm max-w-xs mb-4 leading-relaxed">
              AI Gateway & Router terpercaya di Indonesia. Satu endpoint untuk semua kebutuhan AI dengan tarif Rupiah transparan.
            </p>
          </div>
          
          {/* Product */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-sm">Produk</h4>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="#models">Katalog Model</a>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="#pricing">Harga Rupiah</a>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="#features">Keunggulan</a>
          </div>
          
          {/* Integrasi */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-sm">Integrasi</h4>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="/AGENT.md" target="_blank">Panduan AGENT.md</a>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="/login">Dashboard Client</a>
            <a className="text-gray-400 hover:text-teal-400 text-sm transition-colors" href="/login?tab=register">Daftar API Key</a>
          </div>
          
          {/* Dukungan */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-sm">Metode Pembayaran</h4>
            <span className="text-gray-400 text-sm">QRIS Instant</span>
            <span className="text-gray-400 text-sm">BCA / Mandiri / BNI</span>
            <span className="text-gray-400 text-sm">GoPay / OVO / Shopee</span>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-teal-900/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} PALU Router. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-teal-400/70 font-mono">
            <span>Powered by PALU Gateway Engine v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

