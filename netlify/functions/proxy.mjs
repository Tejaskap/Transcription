export async function handler(event) {
  const url = event.queryStringParameters && event.queryStringParameters.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing url parameter' };
  }

  try {
    let response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return { statusCode: response.status, body: 'Failed to fetch file' };
    }

    // Google Drive returns an HTML confirmation page for large files.
    // Detect it and follow the confirmed download link.
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
      if (confirmMatch) {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) {
          const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${idMatch[1]}`;
          response = await fetch(confirmUrl, { redirect: 'follow' });
          if (!response.ok) {
            return { statusCode: response.status, body: 'Failed to fetch confirmed file' };
          }
        }
      }
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const finalContentType = response.headers.get('content-type') || 'application/octet-stream';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': finalContentType,
        'Access-Control-Allow-Origin': '*'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: 'Proxy error: ' + e.message };
  }
}
