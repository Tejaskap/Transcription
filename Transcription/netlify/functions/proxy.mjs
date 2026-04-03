exports.handler = async function(event) {
  const url = event.queryStringParameters && event.queryStringParameters.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing url parameter' };
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return { statusCode: response.status, body: 'Failed to fetch file' };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: 'Proxy error: ' + e.message };
  }
};
