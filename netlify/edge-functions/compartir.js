export default async (request, context) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // Si no hay ID, redirigir al inicio
    if (!id) {
        return Response.redirect(new URL("/", request.url), 302);
    }

    try {
        // 1. Consultar directamente a la API de PocketHost
        const pbUrl = `https://ver.pockethost.io/api/collections/articulos/records/${id}`;
        const response = await fetch(pbUrl);
        
        if (!response.ok) {
            return Response.redirect(new URL("/", request.url), 302);
        }
        
        const record = await response.json();

        // 2. Armar la URL exacta de la imagen en PocketBase
        // Por defecto ponemos el logo, pero si la noticia tiene imagen, la reemplazamos
        let imageUrl = "https://visionentrerios.com.ar/logotipo.png";
        if (record.imagen) {
            imageUrl = `https://ver.pockethost.io/api/files/articulos/${record.id}/${record.imagen}`;
        }

        // 3. Crear un HTML básico con las etiquetas (Open Graph) para WhatsApp/Facebook
        // y una redirección automática a la noticia real para los humanos
        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                
                <!-- Metadatos dinámicos para redes sociales -->
                <meta property="og:title" content="${record.titulo.replace(/"/g, '&quot;')} | VER">
                <meta property="og:description" content="${record.bajada.replace(/"/g, '&quot;')}">
                <meta property="og:image" content="${imageUrl}">
                <meta property="og:url" content="${request.url}">
                <meta property="og:type" content="article">
                <meta name="twitter:card" content="summary_large_image">
                
                <title>${record.titulo} | VER</title>
                
                <!-- Redirección inmediata a la noticia real -->
                <meta http-equiv="refresh" content="0; url=/noticia.html?id=${record.id}">
                <script>window.location.href = "/noticia.html?id=${record.id}";</script>
            </head>
            <body>
                <p>Redirigiendo a la noticia...</p>
            </body>
            </html>
        `;

        // 4. Entregar este HTML al bot de WhatsApp
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });

    } catch (error) {
        return Response.redirect(new URL("/", request.url), 302);
    }
};
