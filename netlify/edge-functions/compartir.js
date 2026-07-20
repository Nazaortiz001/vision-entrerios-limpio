export default async (request, context) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // Si entran sin ID, cargamos la página normal sin tocar nada
    if (!id) return context.next();

    try {
        // 1. Buscamos la noticia en tu PocketBase PAGO (Respuesta inmediata)
        const pbReq = await fetch(`https://ver.pockethost.io/api/collections/articulos/records/${id}`);
        if (!pbReq.ok) return context.next();
        
        const articulo = await pbReq.json();

        // 2. Agarramos tu archivo noticia.html original
        const response = await context.next();
        let html = await response.text();

        // 3. Inyectamos la foto y el título exacto de la noticia a la fuerza
        if (articulo.imagen) {
            const imgUrl = `https://ver.pockethost.io/api/files/${articulo.collectionId}/${articulo.id}/${articulo.imagen}?thumb=800x600`;
            
            html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${articulo.titulo}">`);
            html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${articulo.bajada}">`);
            html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${imgUrl}">`);
        }

        // 4. Le servimos la web perfecta a WhatsApp
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });
    } catch (error) {
        // Si hay un error, carga la web normal para que NUNCA de 404
        return context.next();
    }
};