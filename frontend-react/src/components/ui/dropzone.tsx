import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import type { DropEvent, DropzoneOptions, FileRejection } from 'react-dropzone';
import { UploadIcon } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DropzoneContextType = {
  src?: File[];
  accept?: DropzoneOptions['accept'];
  maxSize?: DropzoneOptions['maxSize'];
  minSize?: DropzoneOptions['minSize'];
  maxFiles?: DropzoneOptions['maxFiles'];
};

const renderBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)}${units[unitIndex]}`;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);

export type DropzoneProps = Omit<DropzoneOptions, 'onDrop'> & {
  src?: File[];
  className?: string;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
  children?: ReactNode;
};

export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        onError?.(new Error(message));
        return;
      }
      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props,
  });

  return (
    <DropzoneContext.Provider key={JSON.stringify(src)} value={{ src, accept, maxSize, minSize, maxFiles }}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'relative h-auto w-full flex-col gap-1 overflow-hidden p-8',
          isDragActive && 'outline-none ring-1 ring-ring',
          className,
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} disabled={disabled} />
        {children}
      </button>
    </DropzoneContext.Provider>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
};

const maxLabelItems = 3;

export const DropzoneContent = ({ children }: { children?: ReactNode }) => {
  const { src } = useDropzoneContext();
  if (!src) return null;
  if (children) return <>{children}</>;
  return (
    <>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <UploadIcon size={16} />
      </div>
      <p className="my-2 w-full truncate text-sm font-medium">
        {src.length > maxLabelItems
          ? `${src.slice(0, maxLabelItems).map((file) => file.name).join(', ')} y ${src.length - maxLabelItems} más`
          : src.map((file) => file.name).join(', ')}
      </p>
      <p className="w-full text-xs text-muted-foreground">Arrastra y suelta o haz clic para reemplazar</p>
    </>
  );
};

export const DropzoneEmptyState = ({ children }: { children?: ReactNode }) => {
  const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();
  if (src) return null;
  if (children) return <>{children}</>;

  let caption = '';
  if (accept) {
    caption += 'Acepta ';
    caption += Object.keys(accept).join(', ');
  }
  if (minSize && maxSize) caption += ` entre ${renderBytes(minSize)} y ${renderBytes(maxSize)}`;
  else if (minSize) caption += ` al menos ${renderBytes(minSize)}`;
  else if (maxSize) caption += ` menos de ${renderBytes(maxSize)}`;

  return (
    <>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <UploadIcon size={16} />
      </div>
      <p className="my-2 w-full truncate text-sm font-medium">
        Subir {maxFiles === 1 ? 'un archivo' : 'archivos'}
      </p>
      <p className="w-full truncate text-xs text-muted-foreground">Arrastra y suelta o haz clic para subir</p>
      {caption && <p className="text-xs text-muted-foreground">{caption}.</p>}
    </>
  );
};
