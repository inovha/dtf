'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Select, StatusBadge } from '@/components/ui';
import { formatDate, getWhatsAppMessage, getWhatsAppLink } from '@/lib/utils';
import type { Order, OrderFile } from '@/lib/db';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Fetch preview URL when files are available
    if (files.length > 0 && files[0].mime_type.includes('image')) {
      fetchPreviewUrl();
    }
  }, [files]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json() as { order: Order; files: OrderFile[] };
      setOrder(data.order);
      setFiles(data.files);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviewUrl = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/file`);
      if (!response.ok) return;
      const data = await response.json() as { previewUrl?: string };
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !newStatus) return;
    setUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setOrder({ ...order, status: newStatus as Order['status'] });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/file`);
      if (!response.ok) throw new Error('Failed to get download URL');
      
      const data = await response.json() as { downloadUrl: string };
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const message = getWhatsAppMessage(order.status, order.customer_name);
    const link = getWhatsAppLink(order.customer_whatsapp, message);
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-xl font-medium text-white">Pedido no encontrado</h1>
        <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin" 
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Detalle del Pedido</h1>
          <p className="text-sm text-gray-400">ID: {order.id}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Cliente
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {order.customer_name}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                WhatsApp
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {order.customer_whatsapp}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Tipo de DTF
              </label>
              <p className="text-lg font-medium text-white mt-1 uppercase">
                {order.dtf_type}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Fecha
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {formatDate(order.created_at)}
              </p>
            </div>

            {order.notes && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Notas
                </label>
                <p className="text-white mt-1">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File Card */}
        {files.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
              Archivo
            </h2>
            
            {/* Image Preview */}
            {previewUrl && files[0].mime_type.includes('image') && (
              <div className="mb-4 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                <img 
                  src={previewUrl} 
                  alt={files[0].file_name}
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  {files[0].mime_type.includes('image') ? (
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{files[0].file_name}</p>
                  <p className="text-sm text-gray-400">
                    {(files[0].file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleDownload}
                loading={downloading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar Original
              </Button>
            </div>
          </div>
        )}

        {/* Status & Actions Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Estado y Acciones
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Estado actual</label>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-gray-500">→</span>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'processing', label: 'Procesando' },
                    { value: 'ready', label: 'Listo' },
                    { value: 'rejected', label: 'Rechazado' },
                  ]}
                  className="w-40"
                  disabled={updating}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleWhatsApp}
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Avisar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
