import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const telefonos = '222 248 9080 / 222 332 7590';

/**
 * Sección "Contacto" (adaptación del contact-2 de 21st.dev) con datos reales de CAPDIR.
 * No hay endpoint de contacto en el backend: el formulario abre el cliente de correo (mailto).
 */
export function Contacto() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(asunto || `Contacto desde el sitio — ${nombre} ${apellido}`);
    const body = encodeURIComponent(
      `Nombre: ${nombre} ${apellido}\nCorreo: ${correo}\n\n${mensaje}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setEnviado(true);
  };

  return (
    <section id="contacto" className="py-20 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          {/* info */}
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-4xl font-semibold lg:mb-1 lg:text-6xl">Contacto</h1>
              <p className="text-muted-foreground">
                Estamos para responder tus preguntas y ayudarte con tu próximo proyecto. ¡Escríbenos o llámanos!
              </p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center text-2xl font-semibold lg:text-left">Datos de contacto</h3>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <span className="font-bold">Teléfonos: </span>
                  {telefonos}
                </li>
                <li>
                  <span className="font-bold">Cobertura: </span>
                  Estados de Puebla y Tlaxcala
                </li>
                <li>
                  <span className="font-bold">Web: </span>
                  <a href="https://capdir.com.mx" target="_blank" rel="noreferrer" className="underline">
                    capdir.com.mx
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* formulario */}
          <div className="mx-auto flex w-full max-w-screen-md flex-col gap-6 rounded-lg border p-10">
            {enviado ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h3 className="text-xl font-semibold text-foreground">¡Gracias por contactarnos!</h3>
                <p className="text-sm text-muted-foreground">
                  Se abrió tu cliente de correo para enviar el mensaje. También puedes llamarnos directamente.
                </p>
                <Button variant="outline" onClick={() => setEnviado(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="firstname">Nombre</Label>
                    <Input
                      type="text"
                      id="firstname"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="lastname">Apellido</Label>
                    <Input
                      type="text"
                      id="lastname"
                      placeholder="Apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="correo@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    type="text"
                    id="subject"
                    placeholder="Asunto"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar mensaje
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
