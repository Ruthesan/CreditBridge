import { useCallback, useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, FileImage, FileText as FileTextIcon } from 'lucide-react';
import { cn, readableFileSize } from '../../lib/utils';

const ACCEPTED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'];

function iconFor(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return FileImage;
  return FileTextIcon;
}

export function Dropzone({
  onFileSelected,
  selectedFile,
  disabled,
}: {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(
    (e: DragEvent) => {
      handleDrag(e);
      if (!disabled) setDragActive(true);
    },
    [handleDrag, disabled]
  );
  const handleDragOut = useCallback(
    (e: DragEvent) => {
      handleDrag(e);
      setDragActive(false);
    },
    [handleDrag]
  );
  const handleDrop = useCallback(
    (e: DragEvent) => {
      handleDrag(e);
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [handleDrag, disabled, onFileSelected]
  );

  const Icon = selectedFile ? iconFor(selectedFile.name) : UploadCloud;

  return (
    <div
      onDragEnter={handleDragIn}
      onDragOver={handleDrag}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
        dragActive ? 'border-primary bg-primary-50' : 'border-line bg-white',
        disabled && 'opacity-60'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />

      <motion.div
        animate={dragActive ? { scale: 1.08 } : { scale: 1 }}
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl',
          selectedFile ? 'bg-success-50 text-success' : 'bg-primary-50 text-primary'
        )}
      >
        <Icon size={28} />
      </motion.div>

      {selectedFile ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink">{selectedFile.name}</p>
          <p className="mt-0.5 text-xs text-ink-secondary">{readableFileSize(selectedFile.size)}</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-ink">Drag and drop your statement here</p>
          <p className="mt-1 text-xs text-ink-secondary">PDF, Excel, CSV, or image — up to 10MB</p>
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed"
      >
        {selectedFile ? 'Choose a different file' : 'Browse files'}
      </button>
    </div>
  );
}
