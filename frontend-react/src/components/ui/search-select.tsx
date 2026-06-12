import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export interface SearchOption {
  id: number | string;
  label: string;
}

interface SearchSelectProps {
  items: SearchOption[];
  value: number | string | null;
  onChange: (id: number | string | null) => void;
  placeholder?: string;
  emptyText?: string;
}

/**
 * Combobox con búsqueda (Popover + cmdk). Reemplaza el search-select de Angular
 * para los buscadores de "asignar estudio" (solicitante / plantilla).
 */
export function SearchSelect({
  items,
  value,
  onChange,
  placeholder = 'Buscar...',
  emptyText = 'Sin resultados.',
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => {
                    onChange(item.id === value ? null : item.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', item.id === value ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
