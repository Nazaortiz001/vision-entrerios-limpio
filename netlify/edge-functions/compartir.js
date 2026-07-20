export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.redirect("https://visionentrerios.com.ar/", 302);
  }

  // Ahora guardamos la URL de destino al principio
  const urlDestino = `https://visionentrerios.com.ar/noticia.html?id=${id}`;

  try {
    const respuesta = await fetch(`https://ver.pockethost.io/api/collections/articulos/records/${id}`);
    
    // CAMBIO CLAVE: Si Pocketbase nos bloquea, te manda a la noticia igual, nunca al inicio.
    if (!respuesta.ok) {
      return Response.redirect(urlDestino, 302);
    }

    const noticia = await respuesta.json();
    const titulo = noticia.titulo;
    const bajada = noticia.bajada || "Visión Entre Ríos - Periodismo Político y Actualidad";
    const imagenUrl = `https://ver.pockethost.io/api/files/articulos/${id}/${noticia.imagen}`;

    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <meta property="og:title" content="${titulo}" />
        <meta property="og:description" content="${bajada}" />
        <meta property="og:image" content="${imagenUrl}" />
        <meta property="og:url" content="${request.url}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image">
        <meta http-equiv="refresh" content="0;url=${urlDestino}">
      </head>
      <body>
        <script>window.location.href = "${urlDestino}";</script>
      </body>
      </html>
    `, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });

  } catch (error) {
    // Si hay cualquier error raro, te manda a la noticia
    return Response.redirect(urlDestino, 302);
  }
};
