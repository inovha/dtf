'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea } from '@/components/ui';

interface FormData {
  customerName: string;
  customerWhatsapp: string;
  dtfType: string;
  notes: string;
}

interface FileState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  key: string | null;
}

export function OrderForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerWhatsapp: '',
    dtfType: '',
    notes: '',
  });
  
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    uploading: false,
    uploaded: false,
    error: null,
    key: null,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileState((prev) => ({ ...prev, error: 'Solo se permiten archivos PNG o PDF' }));
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileState((prev) => ({ ...prev, error: 'El archivo no puede superar los 50MB' }));
      return;
    }

    setFileState({ file, uploading: true, uploaded: false, error: null, key: null });

    try {
      // Get presigned upload URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener URL de subida');
      }

      const { uploadUrl, key } = await response.json() as { uploadUrl: string; key: string };

      // Upload file directly to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo');
      }

      setFileState((prev) => ({
        ...prev,
        uploading: false,
        uploaded: true,
        key,
      }));
    } catch (err) {
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        error: err instanceof Error ? err.message : 'Error al subir archivo',
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.customerName || !formData.customerWhatsapp || !formData.dtfType) {
      setError('Por favor completá todos los campos obligatorios');
      return;
    }

    if (!fileState.uploaded || !fileState.key) {
      setError('Por favor subí un archivo');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerWhatsapp: formData.customerWhatsapp,
          dtfType: formData.dtfType,
          notes: formData.notes || null,
          file: {
            key: fileState.key,
            name: fileState.file!.name,
            size: fileState.file!.size,
            mimeType: fileState.file!.type,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Error al crear el pedido');
      }

      router.push('/confirmacion');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre completo *"
        name="customerName"
        placeholder="Tu nombre"
        value={formData.customerName}
        onChange={handleInputChange}
        required
      />

      <Input
        label="WhatsApp *"
        name="customerWhatsapp"
        type="tel"
        placeholder="+54 9 11 1234-5678"
        value={formData.customerWhatsapp}
        onChange={handleInputChange}
        required
      />

      <Select
        label="Tipo de DTF *"
        name="dtfType"
        value={formData.dtfType}
        onChange={handleInputChange}
        options={[
          { value: 'textil', label: 'DTF Textil' },
          { value: 'uv', label: 'DTF UV' },
        ]}
        required
      />

      <Textarea
        label="Notas adicionales"
        name="notes"
        placeholder="Indicaciones especiales, cantidad, tamaño, etc."
        value={formData.notes}
        onChange={handleInputChange}
        rows={3}
      />

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Archivo (PNG o PDF) *
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.pdf,image/png,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${fileState.uploaded 
              ? 'border-green-500/50 bg-green-500/10' 
              : fileState.error 
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-white/20 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10'
            }
          `}
        >
          {fileState.uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-300">Subiendo archivo...</p>
            </div>
          ) : fileState.uploaded ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-300 font-medium">{fileState.file?.name}</p>
              <p className="text-sm text-gray-400">Click para cambiar</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-300">Hacé click para subir tu archivo</p>
              <p className="text-sm text-gray-500">PNG o PDF (máx. 50MB)</p>
            </div>
          )}
        </div>
        
        {fileState.error && (
          <p className="text-sm text-red-400">{fileState.error}</p>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={!fileState.uploaded || submitting}
      >
        Enviar Pedido
      </Button>
    </form>
  );
}
