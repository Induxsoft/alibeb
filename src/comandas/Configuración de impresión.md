# Configuración de impresión

El módulo **Configuración de impresión** permite definir la forma en que se gestionan las impresiones dentro del dispositivo, ofreciendo flexibilidad para adaptarse tanto a entornos conectados a una red local como a dispositivos con controladores integrados.  

En este módulo se pueden seleccionar las siguientes opciones de impresión:

- **Impresión a través del servidor**  
- **Impresión directa desde el dispositivo**

Cada método ofrece distintas ventajas según la infraestructura y el tipo de dispositivo utilizado.

---

## Opción: *Impresión a través del servidor*

Esta opción está diseñada para entornos donde los dispositivos cliente, se comunican con un servidor central dentro de una **red local**.  

Cuando se selecciona este modo, las órdenes de impresión se envían primero al servidor, el cual envía el documento a la impresora configurada.

Para que funcione correctamente, es necesario que exista al menos una impresora registrada en el módulo **Gestión de impresoras**, disponible en el backoffice de **v12**.  

Desde ese módulo, el administrador puede:

- Crear, editar o eliminar impresoras.  
- Definir el tipo de impresora (ethernet, USB(windows), stream_linux y archivo).  
- Asignar una dirección IP o puerto de red.  

Una vez configuradas las impresoras, en el módulo de **Configuración de impresión** se podrá seleccionar la impresora deseada para cada dispositivo.

> **Nota:**  
> Si se requiere modificar algún dato o parámetro de una impresora (como nombre, IP, puerto o tipo), el cambio debe realizarse desde el módulo **Gestión de impresoras** en el backoffice de **v12**.  

---

## Opción: *Impresión directa desde el dispositivo*

La opción de **impresión directa** permite enviar los documentos directamente desde el dispositivo sin depender de un servidor intermedio.  
Esta modalidad es ideal para entornos móviles o dispositivos que cuentan con controladores de impresión integrados, como los equipos **Imin** o aquellos que utilizan el **Enterprise Browser para Android**.

Cuando se selecciona esta opción, el sistema solicitará elegir el controlador correspondiente según el dispositivo:

- **Imin:** Utiliza el controlador nativo integrado en los dispositivos Imin, permitiendo una impresión rápida y directa sin configuración adicional.  
- **Genérico:** Usa el controlador estándar del *Enterprise Browser Android*, compatible con la mayoría de impresoras.

> **Nota:**  
> Por defecto, el sistema aplica una configuración estándar para cada tipo de controlador.  
> Sin embargo, el usuario puede personalizar estos valores desde el propio módulo **Configuración de impresión**, ajustando los parámetros a las necesidades del dispositivo o del entorno de trabajo.

---

## Notas generales

- Verifique que las impresoras estén encendidas, conectadas correctamente y disponibles en la red local (en caso de impresión por servidor). 
- Verifique correctamente que opción seleccionar de acuerdo al dispositivo a utilizar.
- Los datos de la configuración se guardan en el dispositivo(memoria del navegador).
